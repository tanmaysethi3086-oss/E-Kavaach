import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const router = Router();

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// AI Clinical Triage Insight
router.post('/triage-insights', async (req: Request, res: Response) => {
  const { symptoms, vitals, patientAge, chronicConditions, allergies } = req.body;

  if (!symptoms) {
    return res.status(400).json({ success: false, message: 'Symptoms description is required.' });
  }

  const ai = getGenAI();

  if (ai) {
    try {
      const prompt = `You are E-KAVACH AI, an emergency clinical decision triage assistant compliant with standard Emergency Severity Index (ESI) protocols.
Evaluate the following emergency case:
- Patient Age: ${patientAge || 'Unknown'}
- Symptoms / Chief Complaint: ${symptoms}
- Vitals: ${JSON.stringify(vitals || {})}
- Known Chronic Conditions: ${Array.isArray(chronicConditions) ? chronicConditions.join(', ') : 'None reported'}
- Known Allergies: ${Array.isArray(allergies) ? allergies.join(', ') : 'None reported'}

Provide a concise, JSON-formatted emergency assessment:
{
  "triageColor": "RED" | "YELLOW" | "GREEN",
  "urgencyLevel": "Immediate Resuscitation (Level 1)" | "Emergent (Level 2)" | "Urgent (Level 3)" | "Non-urgent",
  "differentialDiagnoses": ["diagnosis 1", "diagnosis 2"],
  "recommendedStatActions": ["action 1", "action 2"],
  "contraindications": ["contraindication 1"],
  "clinicalRationale": "Short 1-2 sentence medical rationale"
}
Output ONLY valid JSON.`;

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout after 4s')), 4000)
      );

      const generatePromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const response: any = await Promise.race([generatePromise, timeoutPromise]);

      const text = response?.text || '';
      const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return res.json({
        success: true,
        source: 'gemini-2.5-flash',
        analysis: parsed,
      });
    } catch (err: any) {
      console.warn('Gemini triage API failed or timed out, using clinical rules fallback:', err.message);
      // Fall through to deterministic triage fallback
    }
  }

  // Deterministic Clinical Fallback (if GEMINI_API_KEY is not configured or fails)
  const isChestPain = typeof symptoms === 'string' && /chest|heart|infarct|stemi|breath|dyspnea|unconscious/i.test(symptoms);
  const isTrauma = typeof symptoms === 'string' && /fracture|bleed|accident|collision|fall/i.test(symptoms);

  const fallback = {
    triageColor: isChestPain ? 'RED' : isTrauma ? 'YELLOW' : 'GREEN',
    urgencyLevel: isChestPain ? 'Emergent (Level 2) - Immediate 12-lead ECG' : isTrauma ? 'Urgent (Level 3) - Imaging & Stabilization' : 'Semi-urgent (Level 4)',
    differentialDiagnoses: isChestPain
      ? ['Acute Coronary Syndrome (ACS)', 'Pulmonary Embolism', 'Aortic Dissection']
      : isTrauma
      ? ['Closed Fracture', 'Internal Bleeding / Soft Tissue Contusion']
      : ['Acute Febrile Illness / Viral Infection'],
    recommendedStatActions: isChestPain
      ? ['Stat 12-lead Electrocardiogram (ECG)', 'Troponin I / T point-of-care test', 'Dual antiplatelet loading protocol']
      : isTrauma
      ? ['Immobilize extremity', 'Point-of-care ultrasound (FAST)', 'Intravenous analgesia']
      : ['Vitals recheck', 'Oral rehydration', 'Routine physician review'],
    contraindications: allergies && allergies.length ? [`Watch for documented allergies: ${allergies.join(', ')}`] : ['No known drug contraindications reported.'],
    clinicalRationale: 'Evaluated using E-KAVACH emergency decision rules (Rule-based clinical triage engine). Add GEMINI_API_KEY in environment to enable real-time Gemini model analysis.',
  };

  return res.json({
    success: true,
    source: 'deterministic-clinical-rules',
    analysis: fallback,
  });
});

export default router;

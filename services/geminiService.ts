
import { GoogleGenAI } from "@google/genai";
import { Measurement, MeasurementParameter } from '../types';

// This is a placeholder for the actual API key which should be handled by environment variables.
const API_KEY = process.env.API_KEY;

// A real implementation would handle the API key more securely.
// We will mock the response to avoid needing a real key for this demo.
const USE_MOCK = true;

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const analyzeMeasurementData = async (
  measurements: Measurement[],
  parameters: MeasurementParameter[]
): Promise<string> => {
  if (USE_MOCK || !ai) {
    console.log("Using mocked Gemini response.");
    const outOfSpecCount = measurements.filter(m => !m.isOk).length;
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    if (outOfSpecCount > 0) {
      return `**AI Analysis Summary:**

*   **Overall Status:** Concerns identified.
*   **Key Findings:** ${outOfSpecCount} measurement(s) are out of specification.
*   **Recommendation:** Review the manufacturing process for parameters that are consistently out of tolerance. Focus on machine calibration and tool wear. Further statistical process control (SPC) analysis is recommended.`;
    } else {
      return `**AI Analysis Summary:**

*   **Overall Status:** All measurements are within specified tolerances.
*   **Key Findings:** The production process appears to be stable and capable.
*   **Recommendation:** Continue monitoring the process. No immediate corrective actions are required based on this sample.`;
    }
  }

  const parameterMap = new Map(parameters.map(p => [p.id, p]));
  const formattedData = measurements.map(m => {
    const param = parameterMap.get(m.parameterId);
    return `${param?.name || 'Unknown Parameter'}: ${m.value} ${param?.unit || ''} (Nominal: ${param?.nominal}, Tolerance: -${param?.tolMinus}/+${param?.tolPlus}, Status: ${m.isOk ? 'OK' : 'Not OK'})`;
  }).join('\n');

  const prompt = `
    You are a metrology expert. Analyze the following measurement data from a single manufactured part and provide a concise summary.
    The summary should include an overall status, key findings, and actionable recommendations.

    Measurement Data:
    ${formattedData}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Error: Could not get analysis from AI. Please check your API key and network connection.";
  }
};

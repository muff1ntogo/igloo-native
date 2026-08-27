import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import { buildRange, buildReportData, Period } from "./igloo-report";
import { generateReportHtml } from "./igloo-pdf-template";
import { Reading, MedLog } from "./igloo-data";

export async function exportDoctorReport(
  readings: Reading[],
  meds: MedLog[],
  period: Period = "monthly"
) {
  try {
    const range = buildRange(period);
    const data = buildReportData(readings, meds, range);
    const html = generateReportHtml(data);

    const { uri } = await Print.printToFileAsync({ html });
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
        dialogTitle: `Share ${data.range.label} Vitals Report`,
      });
    } else {
      Alert.alert("Report Generated", `Saved PDF report to ${uri}`);
    }
  } catch (error) {
    console.error("PDF Export Error:", error);
    Alert.alert("Export Error", "Failed to generate Doctor's Summary Report.");
  }
}

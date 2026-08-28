const fs = require('fs');

function fixQuotes(content) {
  return content
    .replace(/from react;/g, 'from "react";')
    .replace(/from react-native;/g, 'from "react-native";')
    .replace(/from react-native-safe-area-context;/g, 'from "react-native-safe-area-context";')
    .replace(/from lucide-react-native;/g, 'from "lucide-react-native";')
    .replace(/from @lib/g, 'from "@lib')
    .replace(/from @components/g, 'from "@components')
    .replace(/from "@lib\/igloo-store/g, 'from "@lib/igloo-store"')
    .replace(/from "@components\/igloo/g, 'from "@components/igloo"')
    .replace(/from "@lib\/tokens/g, 'from "@lib/tokens"');
}

// Fix profile.tsx
const profilePath = 'c:/Users/AJ TAN/Desktop/igloo-native-main/app/(tabs)/profile.tsx';
let profile = fs.readFileSync(profilePath, 'utf8');
profile = fixQuotes(profile);
fs.writeFileSync(profilePath, profile, 'utf8');
console.log('Fixed profile.tsx');

// Fix ProfileSettings.tsx
const psPath = 'c:/Users/AJ TAN/Desktop/igloo-native-main/src/components/igloo/ProfileSettings.tsx';
let ps = fs.readFileSync(psPath, 'utf8');
ps = fixQuotes(ps);
ps = ps
  .replace(/label: Small/g, 'label: "Small"')
  .replace(/label: Medium/g, 'label: "Medium"')
  .replace(/label: Large/g, 'label: "Large"')
  .replace(/label: Once/g, 'label: "Once a day"')
  .replace(/label: Twice/g, 'label: "Twice a day"')
  .replace(/label: 3/g, 'label: "3 times a day"')
  .replace(/label: 4/g, 'label: "4 times a day"')
  .replace(/label: Connected/g, 'label: "Connected"')
  .replace(/label: Not/g, 'label: "Not connected"')
  .replace(/label: Syncing/g, 'label: "Syncing..."');
fs.writeFileSync(psPath, ps, 'utf8');
console.log('Fixed ProfileSettings.tsx');

// Fix Sheet.tsx
const sheetPath = 'c:/Users/AJ TAN/Desktop/igloo-native-main/src/components/igloo/Sheet.tsx';
let sheet = fs.readFileSync(sheetPath, 'utf8');
sheet = fixQuotes(sheet);
sheet = sheet
  .replace(/color=#5C7E8C/g, 'color="#5C7E8C"')
  .replace(/text-primary>›/g, 'text-primary">›</Text>')
  .replace(/text-primary>?/g, 'text-primary">›</Text>');
fs.writeFileSync(sheetPath, sheet, 'utf8');
console.log('Fixed Sheet.tsx');

console.log('All fixes applied');

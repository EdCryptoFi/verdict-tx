/** Country-name → emoji flag (best-effort for TxODDS participant names). */
const MAP: Record<string, string> = {
  Brazil: "🇧🇷", Argentina: "🇦🇷", France: "🇫🇷", England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", Spain: "🇪🇸", Portugal: "🇵🇹",
  Germany: "🇩🇪", Italy: "🇮🇹", Netherlands: "🇳🇱", Belgium: "🇧🇪", Croatia: "🇭🇷", Uruguay: "🇺🇾",
  Mexico: "🇲🇽", USA: "🇺🇸", "United States": "🇺🇸", Canada: "🇨🇦", Japan: "🇯🇵", "South Korea": "🇰🇷",
  Morocco: "🇲🇦", Senegal: "🇸🇳", Ghana: "🇬🇭", Nigeria: "🇳🇬", Cameroon: "🇨🇲", Egypt: "🇪🇬",
  Switzerland: "🇨🇭", Colombia: "🇨🇴", Norway: "🇳🇴", Sweden: "🇸🇪", Denmark: "🇩🇰", Poland: "🇵🇱",
  Ecuador: "🇪🇨", Peru: "🇵🇪", Chile: "🇨🇱", Australia: "🇦🇺", Qatar: "🇶🇦", "Saudi Arabia": "🇸🇦",
  Myanmar: "🇲🇲", Vietnam: "🇻🇳",
};

export function flag(name: string): string {
  return MAP[name] ?? "🏳️";
}

const severityStyles = {
  CRITICAL: "bg-red-50 border-red-300 text-red-800",
  HIGH: "bg-amber-50 border-amber-300 text-amber-800",
  MEDIUM: "bg-yellow-50 border-yellow-200 text-yellow-800",
  LOW: "bg-green-50 border-green-200 text-green-800",
};

const dotColors = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-amber-500",
  MEDIUM: "bg-yellow-400",
  LOW: "bg-green-500",
};

export default function AlertBanner({ alert }) {
  const style = severityStyles[alert.severity] || severityStyles.LOW;
  const dot = dotColors[alert.severity] || dotColors.LOW;

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${style}`}>
      <div className={`w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0 ${dot}`} />
      <div>
        <span className="font-medium">{alert.severity}</span>
        {" — "}
        {alert.title}
        {alert.country && (
          <span className="ml-1 opacity-70">· {alert.country}</span>
        )}
      </div>
    </div>
  );
}
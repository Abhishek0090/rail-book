
const LegendItem = ({ color, text }: { color: string; text: string }) => (
  <div className="flex items-center gap-4">
    <span className={`h-8 w-8 rounded-lg ${color}`} />
    <p className="text-gray-700 text-sm md:text-base">{text}</p>
  </div>
);
export default LegendItem;

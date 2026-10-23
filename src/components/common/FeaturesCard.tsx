const FeaturesCard = ({
  heading,
  features,
}: {
  heading: string;
  features: Array<{
    icon: React.ReactNode;
    title: string;
    desc: string;
  }>;
}) => {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <h2 className="mb-12 text-center text-3xl font-semibold text-gray-800">
        {heading}
      </h2>

      <div className="grid gap-10 md:grid-cols-2">
        {features.map((item, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100">
              {item.icon}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {item.title}
              </h3>
              <p className="mt-1 text-gray-600">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesCard;

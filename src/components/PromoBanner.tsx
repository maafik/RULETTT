interface PromoBannerProps {
  variant: "yellow" | "purple";
  text: string;
}

const PromoBanner = ({ variant, text }: PromoBannerProps) => {
  const bgColor = variant === "yellow" ? "bg-primary" : "bg-secondary";
  const textColor = variant === "yellow" ? "text-primary-foreground" : "text-secondary-foreground";

  return (
    <div
      className={`${bgColor} ${textColor} rounded-[20px] px-6 py-5 font-medium shadow-md transition-all hover:shadow-lg active:scale-[0.98]`}
    >
      {text}
    </div>
  );
};

export default PromoBanner;

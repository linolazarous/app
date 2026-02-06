export default function Logo({ size = "default", showText = true, className = "" }) {
  const sizes = {
    small: { img: "h-6 w-6", text: "text-base" },
    default: { img: "h-8 w-8", text: "text-xl" },
    large: { img: "h-10 w-10", text: "text-2xl" },
    xl: { img: "h-12 w-12", text: "text-3xl" },
  };

  const { img, text } = sizes[size] || sizes.default;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/logo.png" 
        alt="CursorCode AI" 
        className={`${img} object-contain`}
      />
      {showText && (
        <span className={`font-outfit font-bold text-white ${text}`}>
          CursorCode <span className="text-electric">AI</span>
        </span>
      )}
    </div>
  );
}

import * as React from "react";

function SectionHeader({ text }) {
  return (
    <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
      {text}
    </h3>
  );
}

export default SectionHeader;
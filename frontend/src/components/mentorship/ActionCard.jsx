import * as React from "react";

function ActionCard({ src, mainText, subText, buttonText, onClick }) {
  return (
    <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center gap-4">
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-14"
          style={{ backgroundImage: `url(${src})` }}
        ></div>
        <div className="flex flex-col justify-center">
          <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">{mainText}</p>
          <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">{subText}</p>
        </div>
      </div>
      <div className="shrink-0">
        <button
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#1980e6] text-white text-sm font-medium leading-normal w-fit hover:bg-[#146bb8] transition-colors duration-300"
          onClick={onClick} // ✅ Add onClick event
        >
          <span className="truncate">{buttonText}</span>
        </button>
      </div>
    </div>
  );
}

export default ActionCard;

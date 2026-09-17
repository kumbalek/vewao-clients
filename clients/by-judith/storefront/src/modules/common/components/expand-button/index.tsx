import React, { useState, useEffect, useRef } from "react"

interface ExpandableButtonProps {
  expandedContent?: React.ReactNode
}

const ExpandableButton: React.FC<ExpandableButtonProps> = ({
  expandedContent,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside (for touch devices)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const isTouchDevice = () => {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0
  }

  return (
    <div
      ref={buttonRef}
      className={`flex flex-col items-end group text-black transition-all duration-300`}
      onMouseEnter={() => !isTouchDevice() && setIsExpanded(true)}
      onMouseLeave={() => !isTouchDevice() && setIsExpanded(false)}
    >
      {expandedContent && (
        <div
          className={`absolute z-20 left-0 top-6 small:top-10 bg-white rounded-[1.4rem] border px-4 py-2 mb-2 flex flex-col items-start space-y-2 duration-300 ${
            isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
        >
          {React.Children.map(expandedContent, (child, index) => (
            <div
              className={`transform transition-all duration-300 ease-out
                ${isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-50"}
              `}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {child}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => isTouchDevice() && setIsExpanded(!isExpanded)}
        className="absolute z-10 top-0 left-0 w-6 h-6 small:w-10 small:h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-gray-100 transition-all duration-300"
      >
        <div
          className={`bg-gold rounded-full transition-all 
            ${
              isExpanded
                ? "w-4 h-4 small:w-6 small:h-6 scale-100 duration-300"
                : "w-3 h-3 small:w-5 small:h-5 scale-100 animate-breathe"
            }
          `}
        />
      </button>
    </div>
  )
}

export default ExpandableButton

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';
export type TooltipVariant = 'default' | 'info' | 'warning' | 'error' | 'success';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: TooltipPosition;
  variant?: TooltipVariant;
  delay?: number;
  disabled?: boolean;
  className?: string;
  maxWidth?: string;
  showArrow?: boolean;
  interactive?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'auto',
  variant = 'default',
  delay = 500,
  disabled = false,
  className = '',
  maxWidth = '300px',
  showArrow = true,
  interactive = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState<TooltipPosition>('top');
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const variantStyles = {
    default: 'bg-slate-900 text-slate-100 border-slate-700',
    info: 'bg-blue-900 text-blue-100 border-blue-700',
    warning: 'bg-yellow-900 text-yellow-100 border-yellow-700',
    error: 'bg-red-900 text-red-100 border-red-700',
    success: 'bg-green-900 text-green-100 border-green-700'
  };

  const arrowStyles = {
    default: 'border-slate-900',
    info: 'border-blue-900',
    warning: 'border-yellow-900',
    error: 'border-red-900',
    success: 'border-green-900'
  };

  const calculatePosition = (triggerRect: DOMRect, tooltipRect: DOMRect): { position: TooltipPosition; x: number; y: number } => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    
    const spacing = 8; // Gap between trigger and tooltip
    
    let finalPosition = position;
    let x = 0;
    let y = 0;

    // Auto-detect best position if position is 'auto'
    if (position === 'auto') {
      const spaceTop = triggerRect.top;
      const spaceBottom = viewportHeight - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = viewportWidth - triggerRect.right;

      if (spaceTop >= tooltipRect.height + spacing) {
        finalPosition = 'top';
      } else if (spaceBottom >= tooltipRect.height + spacing) {
        finalPosition = 'bottom';
      } else if (spaceRight >= tooltipRect.width + spacing) {
        finalPosition = 'right';
      } else if (spaceLeft >= tooltipRect.width + spacing) {
        finalPosition = 'left';
      } else {
        // Fallback to position with most space
        finalPosition = spaceBottom > spaceTop ? 'bottom' : 'top';
      }
    }

    // Calculate coordinates based on final position
    switch (finalPosition) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - spacing;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + spacing;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - spacing;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + spacing;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
    }

    // Ensure tooltip stays within viewport bounds
    x = Math.max(8, Math.min(x, viewportWidth - tooltipRect.width - 8));
    y = Math.max(8, Math.min(y, viewportHeight - tooltipRect.height - 8));

    // Add scroll offset
    x += scrollX;
    y += scrollY;

    return { position: finalPosition, x, y };
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    const { position: newPosition, x, y } = calculatePosition(triggerRect, tooltipRect);
    
    setActualPosition(newPosition);
    setCoordinates({ x, y });
  };

  const showTooltip = () => {
    if (disabled || !content.trim()) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Update position after tooltip becomes visible
      requestAnimationFrame(updatePosition);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleMouseEnter = () => {
    showTooltip();
  };

  const handleMouseLeave = () => {
    if (!interactive) {
      hideTooltip();
    }
  };

  const handleFocus = () => {
    showTooltip();
  };

  const handleBlur = () => {
    hideTooltip();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      hideTooltip();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isVisible) {
        updatePosition();
      }
    };

    const handleResize = () => {
      if (isVisible) {
        updatePosition();
      }
    };

    if (isVisible) {
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Clone children to add event handlers
  const clonedChildren = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    'aria-describedby': isVisible ? 'tooltip' : undefined,
    tabIndex: children.props.tabIndex ?? 0
  });

  const getArrowClasses = () => {
    const baseArrow = 'absolute w-0 h-0';
    const arrowColor = arrowStyles[variant];
    
    switch (actualPosition) {
      case 'top':
        return `${baseArrow} left-1/2 top-full transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-${arrowColor}`;
      case 'bottom':
        return `${baseArrow} left-1/2 bottom-full transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-${arrowColor}`;
      case 'left':
        return `${baseArrow} top-1/2 left-full transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-${arrowColor}`;
      case 'right':
        return `${baseArrow} top-1/2 right-full transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-${arrowColor}`;
      default:
        return '';
    }
  };

  const tooltipElement = isVisible && content.trim() ? (
    <div
      ref={tooltipRef}
      id="tooltip"
      role="tooltip"
      className={`
        fixed z-50 px-3 py-2 text-sm rounded-md border shadow-lg
        ${variantStyles[variant]}
        ${className}
        transition-opacity duration-200
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
      style={{
        left: coordinates.x,
        top: coordinates.y,
        maxWidth,
        pointerEvents: interactive ? 'auto' : 'none'
      }}
      onMouseEnter={interactive ? () => setIsVisible(true) : undefined}
      onMouseLeave={interactive ? hideTooltip : undefined}
    >
      {content}
      {showArrow && (
        <div className={getArrowClasses()} />
      )}
    </div>
  ) : null;

  return (
    <>
      {clonedChildren}
      {tooltipElement && createPortal(tooltipElement, document.body)}
    </>
  );
};

export default Tooltip; 
import { useEffect, useRef, useState } from 'react';

export default function FilterSelect({ id, label, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const selectedOption = options[selectedIndex];
  const listboxId = `${id}-listbox`;

  useEffect(() => {
    setActiveIndex(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [isOpen]);

  const chooseOption = (index) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setActiveIndex(index);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if (event.key === 'Tab') {
      setIsOpen(false);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (isOpen) chooseOption(activeIndex);
      else setIsOpen(true);
      return;
    }

    const movements = {
      ArrowDown: Math.min(activeIndex + 1, options.length - 1),
      ArrowUp: Math.max(activeIndex - 1, 0),
      Home: 0,
      End: options.length - 1,
    };

    if (Object.hasOwn(movements, event.key)) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex(movements[event.key]);
    }
  };

  return (
    <div className={`filter-field ${isOpen ? 'is-open' : ''}`}>
      <label id={`${id}-label`} htmlFor={id}>{label}</label>
      <div ref={rootRef} className={`custom-select ${isOpen ? 'is-open' : ''}`}>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          className="custom-select-trigger"
          role="combobox"
          aria-labelledby={`${id}-label ${id}-value`}
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-activedescendant={isOpen ? `${id}-option-${activeIndex}` : undefined}
          onClick={() => setIsOpen((open) => !open)}
          onKeyDown={handleKeyDown}
        >
          <span id={`${id}-value`}>{selectedOption?.label}</span>
          <span className="custom-select-chevron" aria-hidden="true" />
        </button>

        {isOpen && (
          <div id={listboxId} className="custom-select-menu" role="listbox" aria-labelledby={`${id}-label`}>
            {options.map((option, index) => (
              <button
                id={`${id}-option-${index}`}
                key={option.value}
                type="button"
                role="option"
                className={`custom-select-option ${index === selectedIndex ? 'is-selected' : ''} ${index === activeIndex ? 'is-active' : ''}`}
                aria-selected={index === selectedIndex}
                onClick={() => chooseOption(index)}
                onPointerMove={() => setActiveIndex(index)}
              >
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

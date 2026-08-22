"use client";

import { useSelect } from "downshift";
import { useEffect, useId, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps {
  items: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  buttonClassName?: string;
  ariaLabel?: string;
}

function itemToString(item: SelectOption | null): string {
  return item ? item.label : "";
}

function getItemClassName(
  disabled = false,
  isSelected = false,
  isHighlighted = false
): string {
  const base =
    "flex cursor-pointer items-center justify-between rounded-[var(--radius-xs)] px-3 py-2 text-xs sm:text-sm transition-colors";

  if (disabled) {
    return `${base} cursor-not-allowed opacity-40 text-[var(--muted)]`;
  }
  if (isSelected) {
    return `${base} bg-[var(--primary)]/10 font-bold text-[var(--primary)]`;
  }
  if (isHighlighted) {
    return `${base} bg-[var(--background)] text-[var(--ink)]`;
  }
  return `${base} text-[var(--ink)]`;
}

export function Select({
  items,
  value,
  defaultValue,
  onChange,
  placeholder = "Seleccioná una opción...",
  name,
  id: customId,
  disabled = false,
  required = false,
  className = "",
  buttonClassName = "",
  ariaLabel,
}: SelectProps) {
  const generatedId = useId();
  const selectId = customId || generatedId;

  // Find initial item
  const initialValue = value === undefined ? defaultValue : value;
  const initialItem = items.find((it) => it.value === initialValue) ?? null;

  const [selectedItem, setSelectedItem] = useState<SelectOption | null>(
    initialItem
  );

  // Synchronize when controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      const match = items.find((it) => it.value === value) ?? null;
      setSelectedItem(match);
    }
  }, [value, items]);

  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
    highlightedIndex,
  } = useSelect<SelectOption>({
    items,
    itemToString,
    selectedItem,
    onSelectedItemChange: ({ selectedItem: newSelectedItem }) => {
      if (newSelectedItem) {
        setSelectedItem(newSelectedItem);
        onChange?.(newSelectedItem.value);
      } else {
        setSelectedItem(null);
        onChange?.("");
      }
    },
  });

  return (
    <div className={`relative w-full ${className}`}>
      {/* Hidden input for native HTML form submissions / server actions */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={selectedItem?.value ?? ""}
          required={required}
        />
      )}

      {/* Trigger Button */}
      <button
        type="button"
        {...getToggleButtonProps({
          id: selectId,
          disabled,
          "aria-label": ariaLabel || placeholder,
          className: `flex min-h-[40px] w-full items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3.5 py-2 text-left text-xs sm:text-sm text-[var(--ink)] shadow-2xs transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] disabled:cursor-not-allowed disabled:opacity-50 ${buttonClassName}`,
        })}
      >
        <span
          className={`truncate ${
            selectedItem
              ? "font-medium text-[var(--ink)]"
              : "text-[var(--muted)]"
          }`}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </span>

        <span className="shrink-0 text-[var(--muted)]">
          <svg
            className={`h-4 w-4 transition-transform duration-150 ${
              isOpen ? "rotate-180" : ""
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {/* Floating Menu Listbox */}
      <ul
        {...getMenuProps({
          className: `absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-1 text-xs sm:text-sm shadow-lg [scrollbar-width:thin] focus:outline-none ${
            isOpen ? "block" : "hidden"
          }`,
        })}
      >
        {isOpen &&
          items.map((item, index) => {
            const isSelected = selectedItem?.value === item.value;
            const isHighlighted = highlightedIndex === index;

            return (
              <li
                key={item.value}
                {...getItemProps({
                  item,
                  index,
                  disabled: item.disabled,
                  className: getItemClassName(
                    item.disabled,
                    isSelected,
                    isHighlighted
                  ),
                })}
              >
                <div className="flex flex-col">
                  <span>{item.label}</span>
                  {item.description && (
                    <span className="text-xs text-[var(--muted)]">
                      {item.description}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <span className="shrink-0 text-[var(--primary)]">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </li>
            );
          })}
      </ul>
    </div>
  );
}

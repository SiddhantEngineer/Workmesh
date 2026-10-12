"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" style={navStyle}>
      <ol style={listStyle}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} style={itemStyle}>
              {item.href && !isLast ? (
                <Link href={item.href} className="breadcrumb-link">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  style={currentStyle}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <ChevronRight
                  size={13}
                  style={dividerStyle}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

const navStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "4px 0",
};

const listStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  listStyle: "none",
  margin: 0,
  padding: 0,
  fontSize: "0.84rem",
};

const itemStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
};

const linkStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  textDecoration: "none",
  fontWeight: 500,
  transition: "color 0.15s ease",
};

const currentStyle: React.CSSProperties = {
  color: "var(--text-primary)",
  fontWeight: 600,
};

const dividerStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  margin: "0 6px",
  flexShrink: 0,
};

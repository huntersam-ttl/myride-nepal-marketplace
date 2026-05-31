import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "br",
  "hr",
  "a",
  "img",
  "pre",
  "code",
];

const ALLOWED_ATTRIBUTES = ["href", "title", "src", "alt", "width", "height"];
const BASE_URL = "https://myridenepal.invalid";

function isSafeRelativeUrl(value: string) {
  return (
    (value.startsWith("/") && !value.startsWith("//")) ||
    value.startsWith("./") ||
    value.startsWith("../") ||
    value.startsWith("#")
  );
}

function isAllowedLinkUrl(value: string) {
  const normalized = value.trim();
  if (!normalized) return false;
  if (isSafeRelativeUrl(normalized)) return true;

  try {
    const { protocol } = new URL(normalized, BASE_URL);
    return ["http:", "https:", "mailto:", "tel:"].includes(protocol);
  } catch {
    return false;
  }
}

function isAllowedImageUrl(value: string) {
  const normalized = value.trim();
  if (!normalized) return false;
  if (isSafeRelativeUrl(normalized) && !normalized.startsWith("#")) return true;

  try {
    const url = new URL(normalized, BASE_URL);
    if (url.protocol === "https:") return true;
    return typeof window !== "undefined" && url.origin === window.location.origin;
  } catch {
    return false;
  }
}

DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
  if (data.attrName === "href" && !isAllowedLinkUrl(data.attrValue)) {
    data.keepAttr = false;
  }

  if (node.nodeName === "IMG" && data.attrName === "src" && !isAllowedImageUrl(data.attrValue)) {
    data.keepAttr = false;
  }
});

export function sanitizeBlogHtml(content: string) {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTRIBUTES,
    ALLOW_ARIA_ATTR: false,
    ALLOW_DATA_ATTR: false,
  });
}

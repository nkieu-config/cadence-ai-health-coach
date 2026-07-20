import { Fragment } from "react";

function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) {
      return (
        <strong key={`${keyPrefix}-${index}`} className="font-semibold">
          {bold[1]}
        </strong>
      );
    }
    return <Fragment key={`${keyPrefix}-${index}`}>{part}</Fragment>;
  });
}

type Block =
  { kind: "para"; lines: string[] } | { kind: "list"; items: { marker: string; text: string }[] };

function toBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trimEnd();
    const bullet = line.match(/^\s*[*-]\s+(.*)$/);
    const numbered = line.match(/^\s*(\d+)\.\s+(.*)$/);

    if (bullet || numbered) {
      const marker = bullet ? "•" : `${numbered![1]}.`;
      const text = bullet ? bullet[1] : numbered![2];
      const last = blocks.at(-1);
      if (last?.kind === "list") last.items.push({ marker, text });
      else blocks.push({ kind: "list", items: [{ marker, text }] });
      continue;
    }

    if (line.trim() === "") {
      const last = blocks.at(-1);
      if (last?.kind === "para") last.lines.push("");
      continue;
    }

    const last = blocks.at(-1);
    if (last?.kind === "para") last.lines.push(line);
    else blocks.push({ kind: "para", lines: [line] });
  }
  return blocks;
}

export function FormattedMessage({ content }: { content: string }) {
  const blocks = toBlocks(content);

  return (
    <div className="space-y-2.5">
      {blocks.map((block, blockIndex) => {
        if (block.kind === "list") {
          return (
            <ul key={blockIndex} className="space-y-1.5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex gap-2">
                  <span className="shrink-0 text-muted-foreground">{item.marker}</span>
                  <span>{renderInline(item.text, `${blockIndex}-${itemIndex}`)}</span>
                </li>
              ))}
            </ul>
          );
        }

        const text = block.lines.join("\n").trim();
        if (!text) return null;
        return (
          <p key={blockIndex} className="whitespace-pre-wrap break-words">
            {renderInline(text, `${blockIndex}`)}
          </p>
        );
      })}
    </div>
  );
}

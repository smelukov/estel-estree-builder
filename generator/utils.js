exports.addIndent = function addIndent(lines, indent = '    ') {
    lines.forEach((line, i) => lines[i] = indent + line);

    return lines;
}
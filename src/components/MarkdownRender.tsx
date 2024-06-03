import { FocusEventHandler, KeyboardEventHandler, forwardRef } from "react";

interface MarkdownRenderProps {
    children: string;
    focused: boolean;
    onKeyDown?: KeyboardEventHandler<HTMLSpanElement>;
    onFocus?: FocusEventHandler<HTMLSpanElement>;
    onBlur?: FocusEventHandler<HTMLSpanElement>;
    onInput?: React.FormEventHandler<HTMLSpanElement>;
}

const renderMarkdown = (children: string, focused: boolean) => {
    switch (true) {
        case children.startsWith("# "):
            return <h1>{focused && <span className="symbol"># </span>}{children.replace("# ", '')}</h1>;
        case children.startsWith("## "):
            return <h2>{focused && <span className="symbol">## </span>}{children.replace("## ", '')}</h2>;
        case children.startsWith("### "):
            return <h3>{focused && <span className="symbol">### </span>}{children.replace("### ", '')}</h3>;
        case children.startsWith("#### "):
            return <h4>{focused && <span className="symbol">#### </span>}{children.replace("#### ", '')}</h4>;
        case children.startsWith("##### "):
            return <h5>{focused && <span className="symbol">##### </span>}{children.replace("##### ", '')}</h5>;
        case children.startsWith("###### "):
            return <h6>{focused && <span className="symbol">###### </span>}{children.replace("###### ", '')}</h6>;
        case children.startsWith("- "):
            return <span>{focused ? <span className="symbol">- </span> : <span>•</span>} {children.replace("- ", '')}</span>
        default:
            return children;
    }
};

const MarkdownRender = forwardRef<HTMLSpanElement, MarkdownRenderProps>(({ onFocus, onBlur, onInput, focused, onKeyDown, children }, ref) => {
    return (
        <span suppressContentEditableWarning contentEditable ref={ref} className="line" onKeyDown={onKeyDown} onFocus={onFocus} onBlur={onBlur} onInput={onInput}>
            {renderMarkdown(children, focused)}
        </span>
    )
})

export default MarkdownRender;
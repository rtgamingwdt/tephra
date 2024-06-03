export default function Tab({ name, close, active, saved }: { name: string, close: () => void, active: boolean, saved: boolean }) {
    return (
        <div {...{ active: `${active}` }} className="tab">
            <span {...{ saved: `${saved}` }}>{name}</span>
            <button className="close" onClick={close}>x</button>
        </div>
    )
}
export default function Loader({ visible }) {
  return (
    <div className={`loader${visible ? "" : " hide"}`}>
      <div>
        <div className="scan-line mono">SCANNING NEARBY SURPLUS…</div>
        <div className="stamp">
          RESCUE
          <br />
          ROUTE
        </div>
        <div className="loader-bar">
          <span></span>
        </div>
      </div>
    </div>
  );
}

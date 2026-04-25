export default function Panel({ children, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-corner tl" />
      <div className="panel-corner tr" />
      <div className="panel-corner bl" />
      <div className="panel-corner br" />
      {children}
    </section>
  );
}

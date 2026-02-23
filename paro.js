// Prestación contributiva España 2026
// 70% primeros 180 días
// 60% desde el día 181
// Con topes mínimos y máximos (orientativos)

document.getElementById("paroForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const baseMensual = Number(this.baseMensual.value);
  const diasCotizados = Number(this.diasCotizados.value);
  const hijos = Number(this.hijos.value);

  const fmtEUR = (n) => n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });

  function duracionPrestacion(dias) {
    if (dias < 360) return 0;
    if (dias <= 539) return 120;
    if (dias <= 719) return 180;
    if (dias <= 899) return 240;
    if (dias <= 1079) return 300;
    if (dias <= 1259) return 360;
    if (dias <= 1439) return 420;
    if (dias <= 1619) return 480;
    if (dias <= 1799) return 540;
    if (dias <= 1979) return 600;
    if (dias <= 2159) return 660;
    return 720;
  }

  const diasPrestacion = duracionPrestacion(diasCotizados);

  const $res = document.getElementById("resultado");
  const $out = document.getElementById("out");

  // KPIs (si existen en el HTML actualizado)
  const $kpiDur = document.getElementById("kpi-duracion");
  const $kpi70 = document.getElementById("kpi-70");
  const $kpi60 = document.getElementById("kpi-60");
  const $kpiMin = document.getElementById("kpi-min");
  const $kpiMax = document.getElementById("kpi-max");
  const $kpiTotal = document.getElementById("kpi-total");

  function setText(el, text) {
    if (el) el.textContent = text;
  }

  function topes(hijos) {
    // OJO: valores orientativos (los tuyos)
    const min = hijos === 0 ? 560 : 749;
    const max = hijos === 0 ? 1225 : (hijos === 1 ? 1400 : 1575);
    return { min, max };
  }

  const { min, max } = topes(hijos);

  // Mostrar bloque resultado
  $res.style.display = "block";

  // No derecho a contributiva
  if (diasPrestacion === 0) {
    setText($kpiDur, "0");
    setText($kpi70, "—");
    setText($kpi60, "—");
    setText($kpiMin, fmtEUR(min));
    setText($kpiMax, fmtEUR(max));
    setText($kpiTotal, "—");

    if ($out) {
      $out.className = "notice bad mt-4";
      $out.innerHTML = "<strong>Sin derecho a contributiva:</strong> menos de 360 días cotizados.";
    }
    return;
  }

  const mensual70 = baseMensual * 0.70;
  const mensual60 = baseMensual * 0.60;

  const mensual70Final = Math.min(Math.max(mensual70, min), max);
  const mensual60Final = Math.min(Math.max(mensual60, min), max);

  const dias70 = Math.min(180, diasPrestacion);
  const dias60 = Math.max(0, diasPrestacion - 180);

  const total =
    (mensual70Final * (dias70 / 30)) +
    (mensual60Final * (dias60 / 30));

  // KPIs
  setText($kpiDur, String(diasPrestacion));
  setText($kpi70, fmtEUR(mensual70Final));
  setText($kpi60, fmtEUR(mensual60Final));
  setText($kpiMin, fmtEUR(min));
  setText($kpiMax, fmtEUR(max));
  setText($kpiTotal, fmtEUR(total));

  // Mensaje inferior (detalle)
  if ($out) {
    $out.className = "notice warn mt-4";
    $out.innerHTML =
      "<strong>Detalle:</strong> " +
      "primer tramo " + dias70 + " días · segundo tramo " + dias60 + " días. " +
      "Tope aplicado según hijos: min " + fmtEUR(min) + " / max " + fmtEUR(max) + ".";
  }
});

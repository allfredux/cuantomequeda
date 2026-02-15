// Prestación contributiva España 2026
// 70% primeros 180 días
// 60% desde el día 181
// Con topes mínimos y máximos oficiales

document.getElementById("paroForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const baseMensual = Number(this.baseMensual.value);
  const diasCotizados = Number(this.diasCotizados.value);
  const hijos = Number(this.hijos.value);

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

  if (diasPrestacion === 0) {
    document.getElementById("resultado").style.display = "block";
    document.getElementById("out").innerHTML =
      "<p>No tienes derecho a prestación contributiva (menos de 360 días cotizados).</p>";
    return;
  }

  function topes(hijos) {
    const min = hijos === 0 ? 560 : 749;
    const max = hijos === 0 ? 1225 : (hijos === 1 ? 1400 : 1575);
    return { min, max };
  }

  const { min, max } = topes(hijos);

  const mensual70 = baseMensual * 0.70;
  const mensual60 = baseMensual * 0.60;

  const mensual70Final = Math.min(Math.max(mensual70, min), max);
  const mensual60Final = Math.min(Math.max(mensual60, min), max);

  const dias70 = Math.min(180, diasPrestacion);
  const dias60 = Math.max(0, diasPrestacion - 180);

  const total =
    (mensual70Final * (dias70 / 30)) +
    (mensual60Final * (dias60 / 30));

  document.getElementById("resultado").style.display = "block";

  document.getElementById("out").innerHTML =
    "<p><strong>Duración estimada:</strong> " + diasPrestacion + " días</p>" +
    "<p><strong>Primeros 180 días:</strong> " +
    mensual70Final.toLocaleString("es-ES", {style:"currency", currency:"EUR"}) +
    " / mes</p>" +
    "<p><strong>Desde el día 181:</strong> " +
    mensual60Final.toLocaleString("es-ES", {style:"currency", currency:"EUR"}) +
    " / mes</p>" +
    "<hr>" +
    "<p><strong>Total estimado aproximado:</strong> " +
    total.toLocaleString("es-ES", {style:"currency", currency:"EUR"}) +
    "</p>";
});

let balls = [];
let orbits = [];

function updateBalls(frame) {
  const svg = document.getElementById("canvas");

  if (!balls.length) {
    frame.forEach((_, i) => {
      const circle = createSVGElement("circle", { r: 5, fill: getColor(i) });
      svg.appendChild(circle);
      balls.push(circle);

      const path = createSVGElement("path", {
        fill: "none",
        stroke: getColor(i),
        "stroke-width": 1,
      });
      svg.appendChild(path);
      orbits.push({ element: path, points: [] });
    });
  }

  // Update position + orbit
  frame.forEach((pos, i) => {
    balls[i].setAttribute("cx", pos[0]);
    balls[i].setAttribute("cy", pos[1]);

    const orbit = orbits[i];
    orbit.points.push(pos);
    orbit.element.setAttribute(
      "d",
      orbit.points
        .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`)
        .join(" ")
    );
  });
}

function createSVGElement(tag, attributes) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attributes).forEach(([key, value]) =>
    element.setAttribute(key, value)
  );
  return element;
}

function getColor(index) {
  const colors = ["red", "blue", "green", "orange", "purple", "brown"];
  return colors[index % colors.length];
}

function fetchFrame() {
  fetch("/simulation")
    .then((res) => res.json())
    .then((frame) => {
      updateBalls(frame);
      requestAnimationFrame(fetchFrame);
    })
    .catch((err) => console.error("Error fetching frame:", err));
}

fetchFrame();

function scale(number, inMin, inMax, outMin, outMax) {
  return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function executeAsync(func) {
  setTimeout(func, 0);
}

function rng(min, max) {
  return min + (Math.random() * (max - min))
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(n, max))
}

function dotprod(arr) {
  let sum = 0;
  arr.map(a => {
    sum += a;
  })
  return sum / arr.length
}
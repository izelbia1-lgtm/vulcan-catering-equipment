const flames = [
  {
    shape: 'M31 275 C6 250 8 212 29 180 C44 157 42 135 32 116 C63 126 65 152 60 172 C83 155 78 122 67 97 C52 64 70 37 101 13 C89 41 95 63 110 86 C127 111 124 134 117 155 C134 145 138 122 135 107 C158 135 163 168 148 197 C139 214 163 233 140 261 C125 279 102 283 82 279 Z',
    colors: ['#d63300', '#ff6a00', '#ffad13', '#fff0a3'],
  },
  {
    shape: 'M51 275 C30 258 37 238 51 215 C65 196 69 181 65 164 C80 173 87 183 86 196 C104 177 112 155 104 132 C127 158 130 178 119 201 C109 220 133 232 123 254 C113 277 86 282 51 275 Z',
    colors: ['#ff9100', '#ffb509', '#ffe252', '#fffbd0'],
  },
  {
    shape: 'M69 274 C52 264 62 245 74 232 C83 220 85 208 84 195 C97 205 104 219 99 234 C112 242 110 260 100 271 C92 278 80 279 69 274 Z',
    colors: ['#ffcb26', '#ffde49', '#fff5a4', '#fffef2'],
  },
]

export function paintFlare(canvas: HTMLCanvasElement | null) {
  const context = canvas?.getContext('2d')
  if (!context) return

  for (const { shape, colors } of flames) {
    const gradient = context.createLinearGradient(0, 0, 0, 280)
    colors.forEach((color, index) => gradient.addColorStop(index / (colors.length - 1), color))
    context.fillStyle = gradient
    context.fill(new Path2D(shape))
  }

  context.fillStyle = '#ff8f17'
  for (const [x, y, radius] of [[55, 53, 2.8], [128, 62, 3.6], [114, 24, 2], [42, 96, 2.4], [145, 84, 2]]) {
    context.beginPath()
    context.ellipse(x, y, radius * .55, radius, .35, 0, Math.PI * 2)
    context.fill()
  }
}

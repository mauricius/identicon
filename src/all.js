import Identicon from './Identicon'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname

  let input = path.split('/')[1]

  if (input.length === 0) {
    return new Response('Please provide the string as first url parameter', {
      status: 400,
    })
  }

  let size = url.searchParams.get('size')

  size = size ? parseInt(size.replace(/[^0-9a-zA-Z]/g, ''), 10) : 100

  if (size > 1000) {
    return new Response('Careful With That Axe, Eugene', { status: 400 })
  }

  const identicon = new Identicon(input, size)

  return new Response(identicon.toPng(), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000',
      ETag: `${input}@${size}`,
    },
  })
}

/**
 * Uncomment to allow browser testing.
 *
 * @param  {String} input
 * @param  {Number} size
 * @return {String}
 */
// function generate(input, size) {
//     const identicon = new Identicon(input, size);

//     return identicon.toDataURL();
// }

// window.generate = generate;

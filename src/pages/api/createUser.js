export default async function handler(req, res) {
  const body = decodeURIComponent(req.query.userData);
  const response = await fetch('https://dummyjson.com/users/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body,
  })
    .then(async (res) => {
      return {
        ok: res.ok,
        data: await res.json(),
      };
    })
    .catch((error) => {
      return error;
    });

  res.status(res.statusCode).json(response);
}

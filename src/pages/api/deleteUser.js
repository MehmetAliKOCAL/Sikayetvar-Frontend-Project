export default async function handler(req, res) {
  const response = await fetch(`https://dummyjson.com/users/${req.query.id}`, {
    method: 'DELETE',
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

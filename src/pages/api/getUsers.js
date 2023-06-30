export default async function handler(req, res) {
  const response = await fetch(
    `https://dummyjson.com/users?limit=${req.query.limit}&skip=${req.query.skip}`
  )
    .then(async (res) => {
      return {
        ok: res.ok,
        ...(await res.json()),
      };
    })
    .catch((error) => {
      return error;
    });

  res.status(res.statusCode).json(response);
}

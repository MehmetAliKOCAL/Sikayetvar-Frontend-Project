export default async function handler(req, res) {
  const response = await fetch(`https://dummyjson.com/users?limit=0`)
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

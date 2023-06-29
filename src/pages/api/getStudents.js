export default async function handler(req, res) {
  const response = await fetch(
    `https://dummyjson.com/users?limit=${req.query.limit}&skip=${req.query.skip}`
  )
    .then(async (res) => {
      return {
        ok: res.ok,
        data: await res.json(),
      };
    })
    .then((res) => {
      if (res.ok)
        return {
          ok: res.ok,
          users: res.data.users,
        };
      else
        return {
          ok: res.ok,
          message: res.data.message,
        };
    })
    .catch((error) => {
      return error;
    });
  res.status(200).json(response);
}

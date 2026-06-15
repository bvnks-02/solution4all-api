export async function paginate(model, query, { page = 1, perPage = 30, sort = { createdAt: -1 } }) {
  const limit = parseInt(perPage);
  const skip = (parseInt(page) - 1) * limit;
  const [totalItems, items] = await Promise.all([
    model.countDocuments(query),
    model.find(query).sort(sort).skip(skip).limit(limit),
  ]);
  return {
    items,
    meta: {
      page: parseInt(page),
      perPage: limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
}

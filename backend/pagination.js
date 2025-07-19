export const createPagination = async (pool, page, pageSize) => {
  const countQuery = "SELECT COUNT(*) FROM lego";
  const countResult = await pool.query(countQuery);

  const totalLegos = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalLegos / pageSize);

  return { page, pageSize, totalLegos, totalPages};
}

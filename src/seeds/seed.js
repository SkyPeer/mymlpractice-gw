const getSqlValues = (dataSetCount, offset) => {
  const valuesSql = [];

  for (let idx = 0; idx < dataSetCount; idx++) {
    valuesSql.push(
      `($${idx * offset + 1}, $${idx * offset + 2}, $${idx * offset + 3}, $${idx * offset + 4}, $${idx * offset + 5}, $${idx * offset + 6})`,
    );
  }
  return valuesSql;
};

const getSql = () => {
  const query = `INSERT INTO articles (slug, title, description, body, "tagList", "authorId")
                    VALUES ${getSqlValues(3, 6)}, 
                    [
                        'first-article1', 'first-article1', 'first-article1', 'first-article1', 'dragons1', 1, 
                        'first-article2', 'first-article2', 'first-article2', 'first-article2', 'dragons2', 2
                    ]`;
  return query;
};

const getDataSet = (dataSetCount) => {
  const result = [];

  const defaultArr = [
    'first-article1',
    'first-article1',
    'first-article1',
    'first-article1',
    'dragons1',
    1,
  ];
  for (let idx = 0; idx < dataSetCount; idx++) {
    result.push(...defaultArr);
  }

  return result;
};

console.log(getDataSet(3));

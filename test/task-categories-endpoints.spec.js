const app = require('../src/app.js');
const helpers = require('./test-helpers');

describe.skip('Task-category Endpoints', () => {
  let db;

  const {
    testUsers,
    testGroups,
    testGroupsMembers,
    testTasks,
    testCategories,
  } = helpers.makeAllFixtures();

  const testUser = testUsers[0];
  const testUser2 = testUsers[1];

  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());
  before('cleanup', () => helpers.cleanTables(db));
  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('GET /api/categories', () => {
    context('Given no categories', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/categories/group/1')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, []);
      });
    });

    context('Given there are categories in the database', () => {
      beforeEach('insert categories', () => {
        return db.into('groop_task_categories').insert(testCategories);
      });

      it('gets the categories from the database', () => {
        const expectedCategories = [
          { category_name: 'Test-category1', group_id: 1 },
          { category_name: 'Test-category2', group_id: 1 },
        ];

        return supertest(app)
          .get('/api/categories/group/1')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectedCategories);
      });
    });
  });

  describe('GET /api/categories/:category_id', () => {
    context('Given no categories', () => {
      it('responds with 500', () => {
        return supertest(app)
          .get('/api/categories/5')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(500);
      });
    });

    context('Given there are categories in the database', () => {
      beforeEach('insert categories', () => {
        return db.into('groop_task_categories').insert(testCategories);
      });

      it('responds with 404 if category is not found', () => {
        return supertest(app)
          .get('/api/categories/9')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: `Category doesn't exist` } });
      });

      it('responds with 200 and the specified category', () => {
        const categoryId = 2;
        const expectedCategory = testCategories[categoryId - 1];
        return supertest(app)
          .get(`/api/categories/${categoryId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectedCategory);
      });
    });
  });

  describe('DELETE /api/categories/:id', () => {
    context('Given no categories', () => {
      it('responds 404 when category does not exist', () => {
        return supertest(app)
          .delete('/api/categories/1')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: "Category doesn't exist" } });
      });
    });

    context('Given there are categories in the database', () => {
      beforeEach('insert categories', () => {
        return db.into('groop_task_categories').insert(testCategories);
      });

      it('removes the category by ID from the database', () => {
        const idToRemove = 2;

        let expectedCategories = [
          {
            id: 1,
            category_name: 'Test-category1',
            group_id: 1,
          },
          {
            id: 3,
            category_name: 'Test-category3',
            group_id: 2,
          },
        ];

        return supertest(app)
          .delete(`/api/categories/${idToRemove}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(204)
          .then(() =>
            supertest(app)
              .get('/api/categories')
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedCategories),
          );
      });
    });
  });

  describe('POST /api/categories', () => {
    it('responds with 400 missing group_id if not supplied', () => {
      const requestBody = {
        category_name: 'Testing Category',
        group_id: '',
      };
      return supertest(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .send(requestBody)
        .expect(400, {
          error: { message: "Missing 'group_id' in request body" },
        });
    });

    it('responds with 400 missing category_name if not supplied', () => {
      const requestBody = {
        group_id: 3,
      };
      return supertest(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .send(requestBody)
        .expect(400, {
          error: { message: "Missing 'category_name' in request body" },
        });
    });

    it('adds a new category to the database', () => {
      const requestBody = {
        category_name: 'Testing Category',
        group_id: '3',
      };
      return supertest(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .send(requestBody)
        .expect(201)
        .expect(res => {
          expect(res.body.category_name).to.eql(requestBody.category_name);
          expect(res.body.group_id).to.eql(requestBody.group_id);
          expect(res.body).to.have.property('id');
        })
        .then(res =>
          supertest(app)
            .get(`/api/categories/${res.body.id}`)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(res.body),
        );
    });
  });
});

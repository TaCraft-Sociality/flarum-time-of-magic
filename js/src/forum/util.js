import app from 'flarum/common/app';

export function rand(min, max) {
  return min + Math.random() * (max - min);
}

export function forumAttribute(name) {
  if (app.forum && typeof app.forum.attribute === 'function') {
    return app.forum.attribute(name);
  }

  const resources = (app.data && app.data.resources) || [];
  const forumRecord = resources.find((r) => r && r.type === 'forums');
  return forumRecord && forumRecord.attributes && forumRecord.attributes[name];
}

export function userPreference(name) {
  if (app.session && app.session.user) {
    return app.session.user.preferences()?.[name];
  }

  const data = app.data || {};
  const userId = data.session && data.session.userId;

  if (!userId) return undefined;

  const userResource = (data.resources || []).find(
    (r) => r && r.type === 'users' && String(r.id) === String(userId)
  );

  return userResource && userResource.attributes && userResource.attributes.preferences
    ? userResource.attributes.preferences[name]
    : undefined;
}
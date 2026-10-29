import app from 'flarum/admin/app';
import TimeOfMagicSettingsPage from './components/TimeOfMagicSettingsPage';

app.initializers.add('stezkoy-time-of-magic', () => {
  app.registry.for('stezkoy-time-of-magic').registerPage(TimeOfMagicSettingsPage);
});
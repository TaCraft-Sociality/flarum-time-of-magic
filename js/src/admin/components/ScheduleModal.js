import Modal from 'flarum/common/components/Modal';
import Switch from 'flarum/common/components/Switch';
import Checkbox from 'flarum/common/components/Checkbox';
import { PREFIX } from '../../common';

export default class ScheduleModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);

    const schedule = this.attrs.schedule;

    this.label = schedule ? schedule.label || '' : '';
    this.mode = schedule ? schedule.mode || 'dates' : 'dates';
    this.theme = schedule ? schedule.theme || 'any' : 'any';
    this.start = schedule ? schedule.start || '' : '';
    this.end = schedule ? schedule.end || '' : '';
    this.startTime = schedule ? schedule.startTime || '18:00' : '18:00';
    this.endTime = schedule ? schedule.endTime || '06:00' : '06:00';
    this.enabled = schedule ? !!schedule.enabled : true;
    this.selectedEffects = (schedule ? schedule.effects : [])
      .map((effect) => {
        const name = typeof effect === 'string' ? effect : effect.name;
        const option = this.attrs.effects.find((o) => o.value === name);
        const noDensity = option && (option.custom || option.noDensity);
        return { name, density: noDensity ? null : (typeof effect === 'object' && effect.density ? effect.density : 'medium') };
      });
  }

  className() {
    return 'TimeOfMagicModal';
  }

  title() {
    return app.translator.trans(PREFIX + '.admin.' + (this.attrs.schedule ? 'scheduler_modal_edit_title' : 'scheduler_modal_add_title'));
  }

  content() {
    return m('form', { onsubmit: (e) => this._save(e) }, [
      m('.Modal-body', [
        this.error
          ? m('.Alert.Alert--error', this.error)
          : null,

        m('.Form-group', [
          m('label', app.translator.trans(PREFIX + '.admin.scheduler_title_label')),
          m('input.FormControl', {
            type: 'text',
            value: this.label,
            placeholder: app.translator.trans(PREFIX + '.admin.scheduler_title_placeholder'),
            oninput: (e) => {
              this.label = e.target.value;
              m.redraw();
            },
          }),
        ]),

        m('.TimeOfMagicModal-row', [
          m('.Form-group', [
            m('label', app.translator.trans(PREFIX + '.admin.scheduler_mode_label')),
            m('select.FormControl', {
              value: this.mode,
              onchange: (e) => {
                this.mode = e.target.value;
                m.redraw();
              },
            }, [
              m('option', { value: 'dates' }, app.translator.trans(PREFIX + '.admin.scheduler_mode_dates')),
              m('option', { value: 'daily' }, app.translator.trans(PREFIX + '.admin.scheduler_mode_daily')),
            ]),
          ]),
          m('.Form-group', [
            m('label', app.translator.trans(PREFIX + '.admin.scheduler_theme_label')),
            m('select.FormControl', {
              value: this.theme,
              onchange: (e) => {
                this.theme = e.target.value;
                m.redraw();
              },
            }, [
              m('option', { value: 'any' }, app.translator.trans(PREFIX + '.admin.scheduler_theme_any')),
              m('option', { value: 'light' }, app.translator.trans(PREFIX + '.admin.scheduler_theme_light')),
              m('option', { value: 'dark' }, app.translator.trans(PREFIX + '.admin.scheduler_theme_dark')),
            ]),
          ]),
        ]),

        this.mode === 'dates'
          ? m('.TimeOfMagicModal-row', [
              m('.Form-group', [
                m('label', app.translator.trans(PREFIX + '.admin.scheduler_start_label')),
                m('input.FormControl', {
                  type: 'datetime-local',
                  value: this.start,
                  oninput: (e) => {
                    this.start = e.target.value;
                    m.redraw();
                  },
                }),
              ]),
              m('.Form-group', [
                m('label', app.translator.trans(PREFIX + '.admin.scheduler_end_label')),
                m('input.FormControl', {
                  type: 'datetime-local',
                  value: this.end,
                  oninput: (e) => {
                    this.end = e.target.value;
                    m.redraw();
                  },
                }),
              ]),
            ])
          : m('.TimeOfMagicModal-row', [
              m('.Form-group', [
                m('label', app.translator.trans(PREFIX + '.admin.scheduler_start_time_label')),
                m('input.FormControl', {
                  type: 'time',
                  value: this.startTime,
                  oninput: (e) => {
                    this.startTime = e.target.value;
                    m.redraw();
                  },
                }),
              ]),
              m('.Form-group', [
                m('label', app.translator.trans(PREFIX + '.admin.scheduler_end_time_label')),
                m('input.FormControl', {
                  type: 'time',
                  value: this.endTime,
                  oninput: (e) => {
                    this.endTime = e.target.value;
                    m.redraw();
                  },
                }),
                m('p.helpText', app.translator.trans(PREFIX + '.admin.scheduler_end_time_help')),
              ]),
            ]),

        m('.Form-group', [
          m('label', app.translator.trans(PREFIX + '.admin.scheduler_effects_label')),
          m('.TimeOfMagicModal-effects', this.attrs.effects.map((effect) => this._effectRow(effect))),
        ]),

        m('.Form-group', [
          m(
            Switch,
            {
              state: this.enabled,
              onchange: (value) => {
                this.enabled = value;
                m.redraw();
              },
            },
            app.translator.trans(PREFIX + '.admin.scheduler_enabled_label')
          ),
        ]),
      ]),

      m('.Modal-footer.TimeOfMagicModal-footer', [
        m('button.Button', { type: 'button', onclick: () => this.hide() }, app.translator.trans(PREFIX + '.admin.scheduler_cancel_button')),
        m('button.Button.Button--primary', { type: 'submit' }, app.translator.trans(PREFIX + '.admin.scheduler_modal_save')),
      ]),
    ]);
  }

  _effectRow(effect) {
    const selected = this.selectedEffects.find((e) => e.name === effect.value);

    return m('.TimeOfMagicModal-effect', [
      m(
        Checkbox,
        {
          state: !!selected,
          onchange: (checked) => {
            if (checked) {
              this.selectedEffects.push({ name: effect.value, density: effect.custom || effect.noDensity ? null : 'medium' });
            } else {
              this.selectedEffects = this.selectedEffects.filter((x) => x.name !== effect.value);
            }
            m.redraw();
          },
        },
        app.translator.trans(PREFIX + '.admin.' + effect.label)
      ),
      effect.custom || effect.noDensity
        ? null
        : m('select.FormControl.TimeOfMagicModal-density' + (selected ? '' : '.is-disabled'), {
            disabled: !selected,
            value: selected ? selected.density || 'medium' : 'medium',
            onchange: (e) => {
              if (selected) {
                selected.density = e.target.value;
                m.redraw();
              }
            },
          }, this._densityOptions()),
    ]);
  }

  _validationError() {
    if (this.mode === 'dates') {
      if (!this.start || !this.end) {
        return 'scheduler_validation_dates_required';
      }

      const start = new Date(this.start).getTime();
      const end = new Date(this.end).getTime();

      if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
        return 'scheduler_validation_end_before_start';
      }
    } else {
      if (!this.startTime || !this.endTime) {
        return 'scheduler_validation_times_required';
      }
    }

    if (!this.selectedEffects.length) {
      return 'scheduler_validation_effects_required';
    }

    return null;
  }

  _densityOptions() {
    return [
      m('option', { value: 'light' }, app.translator.trans(PREFIX + '.admin.density_light')),
      m('option', { value: 'medium' }, app.translator.trans(PREFIX + '.admin.density_medium')),
      m('option', { value: 'heavy' }, app.translator.trans(PREFIX + '.admin.density_heavy')),
    ];
  }

  _save(e) {
    e.preventDefault();

    const errorKey = this._validationError();

    if (errorKey) {
      this.error = app.translator.trans(PREFIX + '.admin.' + errorKey);
      m.redraw();
      return;
    }

    this.error = null;

    const existing = this.attrs.schedule;

    const data = {
      id: existing ? existing.id : Math.random().toString(36).slice(2, 10),
      label: this.label,
      mode: this.mode,
      theme: this.theme,
      enabled: this.enabled,
      effects: this.selectedEffects.map((effect) =>
        effect.density ? { name: effect.name, density: effect.density } : { name: effect.name }
      ),
    };

    if (this.mode === 'dates') {
      data.start = this.start;
      data.end = this.end;
    } else {
      data.startTime = this.startTime;
      data.endTime = this.endTime;
    }

    this.attrs.save(data);

    this.hide();
  }
}
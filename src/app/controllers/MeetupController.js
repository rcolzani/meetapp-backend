import * as Yup from 'yup';
import { isBefore, parseISO } from 'date-fns';
import Meetup from '../models/Meetup';

class MeetupController {
  async index(req, res) {
    const meetups = await Meetup.findAll();
    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      file_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails: body does not contain valid data' });
    }

    const date = parseISO(req.body.date);

    if (isBefore(date, new Date())) {
      return res.status(400).json({ error: 'You cannot create meetups with past dates' })
    }

    const user_id = req.userId;

    const meetup = await Meetup.create({
      ...req.body,
      user_id,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      file_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails: body does not contain valid data' });
    }
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'invalid operation' });
    }

    const meetup = await Meetup.findByPk(id);

    if (!meetup) {
      return res.status(400).json({ error: 'meetup not found' });
    }

    if (meetup.user_id !== req.userId) {
      return res.status(400).json({ error: 'update meetup of another user is not possible' })
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(400).json({ error: 'update past meetups are not available' });
    }
    console.log(req.body);
    const meetupUpdated = await meetup.update(req.body);
    return res.status(400).json(meetupUpdated);

  }
}

export default new MeetupController();

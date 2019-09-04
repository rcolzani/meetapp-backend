import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';
import { isBefore } from 'date-fns';
import { Op, DataTypes } from 'sequelize';

import Mail from '../../lib/Mail';


class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: {
              [Op.gt]: new Date()
            }
          },
          order: ['date']
        },
      ],

    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'invalid operation' });
    }

    const meetup = await Meetup.findByPk(id, {
      include: [{
        model: User,
        attributes: ['name', 'email']
      }]
    });

    if (!meetup) {
      return res.status(400).json({ error: 'meetup not found' });
    }

    if (meetup.user_id === req.userId) {
      return res.status(400).json({ error: 'subscribe to own meetup is not possible' })
    }

    if (meetup.past) {
      return res.status(400).json({ error: 'subscribe to past meetups is not possible' });
    }

    const checksubdate = await Subscription.findOne({
      where: {
        user_id: req.userId
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date
          }
        },
      ],
    })

    if (checksubdate) {
      return res.status(400).json({ error: 'subscribe to two meetups at the same hour is not possible' })
    }

    const subscription = await Subscription.create({
      user_id: req.userId,
      meetup_id: id
    })

    await Mail.sendMail({
      to: `${meetup.User.name} <${meetup.User.email}>`,
      subject: 'Novo usuário inscrito',
      template: 'subscription',
      context: {
        user: meetup.User.name,
        meetup: meetup.title,
      }
    })

    return res.status(400).json(subscription);
  }
}


export default new SubscriptionController();

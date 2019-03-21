import { DayInMiliseconds } from '../consts'

const supportedIntervals = []
supportedIntervals.push(1 * DayInMiliseconds)
supportedIntervals.push(2 * DayInMiliseconds)
supportedIntervals.push(3 * DayInMiliseconds)
supportedIntervals.push(5 * DayInMiliseconds)
supportedIntervals.push(7 * DayInMiliseconds)
supportedIntervals.push(14 * DayInMiliseconds)
supportedIntervals.push(30 * DayInMiliseconds)
supportedIntervals.push(90 * DayInMiliseconds)
supportedIntervals.push(180 * DayInMiliseconds)
supportedIntervals.push(365 * DayInMiliseconds)

export function getDateInterval(from, to) {
    const intervalLength = to - from
    return supportedIntervals.filter(i => intervalLength / i < 7)[0]
}
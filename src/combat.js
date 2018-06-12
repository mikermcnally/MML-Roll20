/**
 * Round
 *  3 phases 
 *    perform general action
 *    can act based on ADR
 *  bout
 *    happens in place of general action
 *    chars stay locked until bout ends
 *    chars declare orientations at start
 */

const start_combat = button_pressed.pipe(filter(button => button === 'Start Combat'), share());
const end_combat = start_combat.pipe(
  switchMapTo(button_pressed.pipe(filter(button => button === 'End Combat')), share())
);

const combat_phase = prompt_character_actions.pipe(
  concatAll()
);

const combat_round = start_combat.pipe(switchMapTo(

))

/** Actions
 -Aim: For Missile Attacks only.You focus in on one target, and increase your odds of hitting it.Your next Missile Attack against that target gains a + 2 bonus.You may normally Aim only
  for one Round, gaining a bonus of +2 to the following Missile Attack.
  With weapons that have the Ease of Aim quality, you may Aim
  for multiple Phases in a row, each time gaining a cumulative + 2 Aim Bonus to your next attack, to a maximum of +6
  for 3 Phases of Aiming.If you successfully Aim three times at a target in succession, you gain an additional bonus equal to your Perception to the attack that follows.If you shift targets, lose sight of the target, or are otherwise disrupted, you lose the Aim Bonus.
 
 Missile Attack: You perform a missile attack Action.There are a few varieties of these.In the event that the target you were attempting to shoot at is incapacitated or becomes unavailable before you get to resolve your missile attack, you may pick a new target against which to make the attack, but only at½ your base dice.Other modifiers apply as normal.
 Shoot lets you make a single missile attack against a target in view.These all have the same basic mechanic: Your Missile Proficiency + Aim Bonuses(
   if you used the Aim Action) make up your Missile Pool.For every multiple of your weapon’ s Range value the enemy is further than the first, your Missile Pool is reduced by 1.
 Roll Missile Pool at your weapon’ s Missile TN.The RS is the enemy’ s Missile Defense.If you equal or exceed that RS, you hit, and may roll on the Missile Hit Table to see where exactly you hit.
 If a Missile Attack exactly equals the Target’ s Defense, it scores a hit with 0 BS, here called a Grazing Hit.Grazing Hits cannot inflict higher than a Level 0 Wound(which are the same regardless of the body part hit) no matter how much damage they would otherwise do .
   Rapid Shot lets you make multiple missile attacks against a target in view.These
 function the same as regular Shoot missile attacks, but declare beforehand how many attacks you intend to make.Each attack after the first reduces your Missile Pool
 for all of the attacks made in this way by 1. So, a character making 5 Rapid Shots suffers a - 4 MP penalty to all five of his attacks.Not all weapons are capable of being used with Rapid Shot.Weapons that can only make a certain number of attacks“ normally” may be able to exceed this limit with the appropriate Talents or weapon special rules.
 Bows: Up to 2 shots can be made with Rapid Shot normally.
 Crossbows: Cannot use Rapid Shot normally.Some crossbows might be designed which are capable of Rapid Shot.
 Firearms: Cannot use Rapid Shot normally.Some firearms with multiple - shot capacity can make up to 5.
 Throwing Weapons: Up to 2 shots can be made with Rapid Shot normally.
 Covering Fire lets you wait
 for an enemy to show himself, and then shoot him
 if he does.Covering Fire suffers an additional - 4 penalty
 if have Moved in this Phase.If a character or other target moves into your field of view or otherwise exposes himself(you can choose another trigger, like waiting
   for the guy to draw his weapon before shooting him, etc.) you may immediately take a Shoot or Rapid Shot action aimed at that character or target.Covering Fire lasts until the next Action you take, but you can choose to simply sustain Covering Fire every Action until something happens.This can allow a character who cannot normally act in Phase 3 to act in Phase 3
 if he Covered in Phase 1.
 Grenade Throw: You spend the Phase throwing a grenade or other object at an area -
   for hitting an enemy with a thrown javelin, knife, etc.use Missile Attack.You may
 throw the object up to its Throwing Distance.Roll ADR at TN 7. The RS is 4
 for landing the grenade within a yard of the target area.If you fail, the
 throw will deviate in a random direction(1 - 3 too close, 4 - 6 too far, 7 - 8 to the left, 9 - 10 to the right) by 2 yards
 for each success by which the roll failed.In the event of a roll with 0 successes, roll deviation as normal - but in this instance, the object will land 10 yards closer to the thrower in a direct line from its deviation point.This is to represent a catastrophic failure to
 throw the missile properly.
 Active Defense: You spend the Phase ducking and dodging enemy attacks.Roll an ADR Test and add BS to your Missile Defense RS.If you declare Active Defense, roll it before resolving any other Actions - it applies against attacks that occur before your Initiative in the Phase, as well as those after.This can be performed either standing still behind one piece of cover, or
 while running along or between close(2 - 3 yards apart) pieces of cover.
 Take Cover: Similar to Active Defense, but only usable behind at least Half Cover.You simply duck down and hide.You now have Full Cover, meaning you cannot be hit by attacks which would not penetrate the material you are taking cover behind.(You are still vulnerable to flanking attacks, though you count as Prone against them.) You cannot move faster than 2 yards per Phase
 while Taking Cover.
 Reload: For weapons like Firearms or Crossbows which must be reloaded in order to be fired, a Reload Action is necessary.This allows you to add[Weapon Proficiency + Dominant Stat(AGI
   for Firearms, STR
   for Crossbows) + Reloading Method] Load / Span to the weapon.Once the Load / Span put into the weapon reaches the Load / Span quality of the weapon, it is reloaded.Moving in the same action as Reloading is not possible unless you are on Horseback, in which
 case your Reload suffers a - 2
 if the horse is moving, and a - 4
 if it is sprinting.
 Sprint:
   You move up to double your Mobility score in yards this Action in lieu of taking any non - Mobility Actions.While sprinting, you gain a + 2 bonus to Defense.
   Engage Attack: Move up to 10 yards into contact(2 yards away from) and initiate Melee Combat with a target.This Combat lasts
   for one Melee Round.If you attack from a flank or behind, this counts as a Surprise Attack.If you cannot come within 2 yards of the target, you cannot initiate Melee Combat.However,
     for every Reach category of your melee weapon past L, you may engage an opponent from 2 additional yards away.For example, an EL reach weapon could engage an opponent from 6 yards away.(This includes movement of the fighters and is not strictly indicative of the weapon’ s length.)
   After the Combat ends,
   if neither party is killed or disabled or retreats, then the characters involved will stay in Combat into the next Phase.Neither will be able to act in the General Action component of the
   Phase, but will
   continue their Melee Bout regardless of whether they would have been able to act in the phase normally.The Melee Bout does not end until one side retreats or is defeated.
   For details on Melee Combat, see below.
   Charge: Move up to 15 Yards into contact with(2 yards away from) a target, and initiate Melee Combat with a target.This movement must be in a straight line, you cannot move around obstacles or otherwise change course.This Combat lasts
   for one Melee Round, after which the Phase ends.You gain a + 4 bonus to your CP in this Round, but you cannot declare any Orientation except Aggressive.If you attack from a flank or behind, this counts as a Surprise Attack.If you cannot come within 2 yards of the target, you cannot initiate Melee Combat.However,
     for every Reach category of your melee weapon past L, you may engage an opponent from 2 additional yards away.For example, an EL reach weapon could engage an opponent from 6 yards away.(This includes movement of the fighters and is not strictly indicative of the weapon’ s length.)
   For details on Melee Combat, see below.
   Flanking & Rear Attacks
   When Charging or moving
   for an Engage, you cannot swing around an unengaged targets to outflank them
   if you began in the front 90 degrees of the target, as your target can see you coming and would realistically turn to face you to avoid being easily surprised.If you start on the side or rear of the target, however, you are not restricted in this manner.
   Monster Attack
   This is an option
   for Monsters only.A Monster Attack is resolved against a number of target characters depending on the Attack’ s profile, and is defended against using a special Attribute Test detailed in the Monster Attack’ s profile.
     [See Hunter’ s Handbook]
 */

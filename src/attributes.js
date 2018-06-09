/**
 * Strength(STR)
 Strength is a character 's ability to apply force, whether that be lifting a cart off a trapped child or
 smashing someone 's head in with a warhammer. This covers your character’s full body strength, not just
 how many phone books he can rip in half.Strength influences many physical activities that are based on
 force and strength, but also determines the base damage inflicted by melee weapons in combat.
 Strength contributes to the Toughness and Mobility Compound Attributes.

 Agility(AGI)
 Agility refers to your character’ s physical and manual dexterity.Agility’ s domain includes acrobatics,
   balancing, and other acts of flexibility.It is an important Attribute in combat, as well as in various
 physical activities and skills.
 Agility contributes to the Adroitness and Mobility Compound Attributes.

 Endurance(END)
 Endurance determines your character’ s stamina and ability to cope with physical strain and exertion.
 Endurance is a combination of qualities, including cardiovascular development, which contributes to your
 character being able to
 continue strenuous activity
 for extended time frames.Endurance also factors into
 how well your character can handle Blood Loss and governs certain Skills.
 Endurance contributes to the Toughness, Carry and Mobility Compound Attributes.

 Health(HLT)
 Health represents your character 's raw constitution, physical robustness, resistance to disease and
 infection, and general state of well - being.When injuries are sustained, having higher Health makes
 wounds easier to recover from.At a HLT score of 1, all other attributes are halved.
 Health contributes to the Toughness Compound Attribute.
 Willpower(WIL)
 Willpower governs your character’ s force of will, determination, and strength of personality.
 It allows your character the ability to focus through distraction, control their emotions, and resist pain,
 intoxication, and other(sometimes magical) influences.It is also a core component in a strong personality
 and thus factors heavily into human interactions.Plus, Willpower reduces the sum total of Pain from all
 Wounds.
 Willpower contributes to the Charisma Compound Attribute, and is also used in the Magic system.
 Wit(WIT)
 Wit is the speed and flexibility of the mind.The Attribute determines your character’ s skill in
   improvisation, and ability to cope with rapid bursts of information and activity without being
 overwhelmed.From telling jokes to dueling with swords, Wit is important
 for many activities, especially
 certain Skills, and is one of the Attributes that no hero should be without.
 Wit contributes to the Adroitness and Charisma Compound Attributes.
 Intelligence(INT)
 Intelligence references your character 's ability to collate, process, recall and connect information in a
 logical manner.It doesn’ t speak to how 'smart'
 your character sounds or acts, but rather how good he is at
 truly understanding concepts and analyzing facts.Intelligence is required primarily in engineering,
   architecture, linguistics, and sciences, where thinking fast isn 't as important as thinking clearly and
 meticulously.Intelligence also aids in analyzing ideas
 for contradictions or inconsistencies.The Attribute
 determines your character’ s ability to examine and retain information, and also to apply logical processes
 to facts.
 Intelligence is used extensively in the Skill and Magic systems.
 Perception(PER)
 Perception determines your character 's awareness of their surroundings, which includes visual, audible,
 and even olfactory(smell) awareness.Perception is important, as it allows your character to spot
 ambushes and gauge distances.It is the basis of many Skills, and also provides half of your MP when
 using ranged weapons.In addition, Perception allows characters to read the expressions of others, spotting
 miniscule movements and cues, which allows greater control over social interactions with other people.
 Perception contributes to the Charisma Compound Attribute.
 Compound Attributes
 Compound Attributes are made from an average or aggregate of multiple core Attributes.These Attributes
 are determined after Character Creation is completed, and factor in your character’ s core Attributes as
 well as any penalties or bonuses related to Race or Boons and Banes.
 Adroitness(ADR)
   (AGI + WIT) / 2
 Adroitness measures your character’ s physical articulation, speed, and mental alacrity.It represents their
 reflexes and their coordination between mind and body.Adroitness is obviously very important in
   fighting, as it contributes directly to your character’ s CP, but it also helps them avoid being tripped,
   knocked over, thrown from rocking horses, flung over the sides of ships, and other things that can be
 avoided with a combination of quick thinking and action.
 Mobility(MOB)
   (STR + AGI + END) / 2
 Running, jumping, climbing: these are all determined by Mobility.Your character can move a number of
   yards equal to his Mobility each Round during combat, or run twice that number, or faster with certain
 Skills and armor enhancements.
 Carry(CAR)
   (STR + END)
 Carry determines how much weight in armor, equipment, and other inventory your character can lug
 around before being encumbered.See Chapter 10
 for more details.
 Toughness(TOU)
   (STR + END + HLT) / 3
 Toughness refers to how resilient your character is to harm.It represents thickness of skin, hardness of
   bone, and layers of callous and scar tissue.Toughness reduces the amount of damage your character takes
 when they are attacked.
 Charisma(CHA)
   (WIL + PER + WIT) / 2
 Charisma determines how well your character interacts with other characters.It’ s their animal magnetism,
   their ability to read people and appeal to other’ s emotions, or‘ get’ them.Charisma also influences your
 character’ s ability to hide their own emotions, or to express themselves in an impassioned manner;
 it is
 used in social interactions of all sorts.Charisma is an important Attribute in the Magic system.
 Grit
   (WIL) / 2
 Grit is a character’ s accumulated resistance to pain, fear, and the shock of injury.Grit reduces the total
 Pain a character has accumulated.(see Chapter 12).Characters with high Grit can
 continue fighting
 through terrible injuries, and keep calm in the face of unspeakable horror.Many people acquire high Grit
 by surviving combat, slaying foes, and enduring injuries.
 Your character’ s starting Grit is determined by their WIL score, but unlike the other Compound
 Attributes, it is not tied to WIL afterwards.Increasing WIL after Character Creation has no effect on Grit,
   nor can it be purchased with Arc Points.Instead, as detailed below, Grit increases through experience.As
 your character is confronted with violence, injury, bloodshed and terror, they have the chance to increase
 their Grit scores.
 */

const strength = attribute_change('strength');
const agility = attribute_change('agility');
const endurance = attribute_change('endurance');
const health = attribute_change('health');
const willpower = attribute_change('willpower');
const wit = attribute_change('wit');
const intelligence = attribute_change('intelligence');
const perception = attribute_change('perception');
const magic = attribute_change('magic');

const adroitness = Rx.combineLatest(agility, wit)
  .pipe(map(function ([agility, wit]) {
    return Math.floor((agility + wit) / 2);
  }));
const mobility = Rx.combineLatest(strength, agility, endurance)
  .pipe(map(function ([strength, agility, endurance]) {
    return Math.floor((strength + agility + endurance) / 2)
  }));
const carry = Rx.combineLatest(strength, endurance)
  .pipe(map(function ([strength, endurance]) {
    return Math.floor((strength + endurance) / 2)
  }));
const toughness = Rx.combineLatest(strength, endurance, health)
  .pipe(map(function ([strength, endurance, health]) {
    return Math.floor((strength + endurance + health) / 3)
  }));
const charisma = Rx.combineLatest(agility, wit)
  .pipe(map(function ([agility, wit]) {
    return Math.floor((agility + wit) / 2)
  }));
const grit = willpower.pipe(
  map(function (willpower) {
    return Math.floor(willpower / 2)
  }));
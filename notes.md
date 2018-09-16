* user clicks on character menu
* click is switch mapped to a menu observable
* the menu observable takes additional clicks and emits observables 
* characters subscribe to user input filtered by id
* variable attributes subscribe to input and filter by attribute name
* variable attributes concat all input value observables

Character inputs should have this form
{
  id: 'character_id',
  attribute: 'attribute_name',
  value: Rx.of(value)
}

Expand is the key for action menu 
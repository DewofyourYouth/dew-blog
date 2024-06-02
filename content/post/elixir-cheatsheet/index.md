---
title: "Elixir Cheatsheet"
description: Some Elixir basics.
date: 2024-06-02T16:31:26+03:00
image: potion.jpg
draft: true
---

## Operators

### Match Operater

In Elixir there is not concept of "assignment", the `=` operator is a **match** operator, not an assignment operator.

```elixir
iex(1)> hello = :hello
hello
iex(2)> {status, msg} = {:error, "You've dropped the ball!"}
{:error, "You've dropped the ball!"}
iex(3)> status
:error
```

### Equal Operator

Check if two things are equal `==`:

```elixir
iex(1)> true == :true  # See booleans - true is attached to the atom :true
true
iex(2)> 2 + 2 == 4
true
```

### The Pipe Operator

Takes pipe operator `|>` the output of a function and uses it as the first argument in the next function.

```elixir
iex(1)> add_3 = fn a -> a + 3 end
#Function<42.105768164/1 in :erl_eval.expr/6>
iex(2)> iex(4)> [1, 3, 5] |>
...(2)> Enum.sum |>
...(2)> add_3.()    # Equivalent to: add_3.(Enum.sum([1, 3, 5]))
12
```

## Basic Data Types

### Booleans

Whether something is `true` of `false`. (Attached from atoms `:true` or `:false`).

### Atoms

Atom are constants. Their name is their value - and they are used similarly to enums in other languages. One of the most common atoms used in elixir is `:ok`.

Example use of atoms:

```elixir
tup1 = {:error, "Shay's mom"}                     # this is a tuple with an atom and a string in it.
tup2 = {:success, "Not Shay's mom!"}
tup3 = {:something_else, "Davie Crocket"}

defmodule HandleMessage do
  def check_message({state, msg}) do               # destructure tuple with pattern matching
    case state do                                  # case based on the state atom
      :error -> "An error occured: '#{msg}' 😭"    # if the state is the :error atom -> do this.
      :success -> "Hurray! '#{msg}' 🎉"            # if the state is the :success atom -> do this.
      _ -> "I don't know what to do with this: '#{msg}' 🤷"    # otherwise -> do this.
    end
  end
end

IO.puts(HandleMessage.check_message tup1)
IO.puts(HandleMessage.check_message tup2)
IO.puts(HandleMessage.check_message tup3)
```

Output:

```
An error occured: 'Shay's mom' 😭
Hurray! 'Not Shay's mom!' 🎉
I don't know what to do with this: 'Davie Crocket' 🤷
```

### Strings

Strings in Elixir are inserted between double quotes and are encoded in UTF-8.

```elixir
iex(1)> "¿Qué pasa?"
"¿Qué pasa?"
```

### Lists

Lists in Elixir are linked lists and are set in square brackets. Many functions for lists are available in the `Enum` module. Lists can be of different types.

```elixir
iex(1)> my_nums_list = [1, 2, 3, 4]
[1, 2, 3, 4]
iex(2)> my_random_stuff_list = [1, "Cheese", :billboard, 33.4]
[1, "Cheese", :billboard, 33.4]
iex(3)> Enum.map(my_nums_list, fn x -> IO.puts(x) end)
1
2
3
4
[:ok, :ok, :ok, :ok]
iex(4)> Enum.map(my_random_stuff_list, fn x -> IO.puts(x) end)
1
Cheese
billboard
33.4
[:ok, :ok, :ok, :ok]
```

### Tuples

### Keyword Lists

### Maps

### Functions

### Integers

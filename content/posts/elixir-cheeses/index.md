---
title: "Pairing Elixir with Cheese"
date: 2026-09-24T18:07:07+03:00
featuredImage: "cheeses.jpg"
categories:
  - Tech & Tools
tags:
  - elixir
  - livebook
  - functional-programming
  - ai
  - llm
  - openai
  - structs
  - pattern-matching
  - exunit
  - cheese
summary: "I built a cheese catalog in Elixir, letting an LLM fill in flavor profiles and pairings — then used pattern matching to keep the data honest."
description: "A hands-on Elixir tutorial: using structs, pattern matching, and the OpenAI API in a Livebook notebook to build an AI-generated cheese catalog with pairing lookups."
code:
  maxShownLines: 999
draft: false
---

I have been playing around with Elixir and I want to make a little tutorial about how to use Elixir with AI and some thoughts about data modeling with Elixir. I also want to make a cheese catalog because I love cheese and I think it would be fun to see how AI can help me with that. First let's install the Req library so we can make HTTP requests to the OpenAI API.

```elixir
Mix.install([
  {:req, "~> 0.7.4"}
])
```

## Playing Around With Cheese

I want to make a cheese struct for my Hall of cheeses. I feel that it would be simpler to just have AI fill in the data since cheese is a thing LLMs are very fond of.

<!-- livebook:{"break_markdown":true} -->

Here is a short list of cheese I'm considering. Just to start off with.

Let's also check how many cheeses we have - just for fun!

```elixir
cheeses = ["mozzerella", "cheddar", "parmesan", "gouda", "swiss", "brie"]
# How many cheeses do I have?
Enum.count(cheeses)
```

```bash
6
```

Just to give a sense of the arrow syntax and functions in Elixir:

```elixir
defmodule Cheese do
  def make_cheese_string(cheese) do
    cheese <> " is a type of cheese."
  end

  def print_cheeses(cheeses) do
    Enum.each(cheeses, fn cheese -> cheese |> # go through each cheese
      String.capitalize() |>  # capitalize each cheese
      make_cheese_string() |>  # make the cheese string
      IO.puts() 
      end)
  end
end

Cheese.print_cheeses(cheeses)
```

```bash
Mozzerella is a type of cheese.
Cheddar is a type of cheese.
Parmesan is a type of cheese.
Gouda is a type of cheese.
Swiss is a type of cheese.
Brie is a type of cheese.
:ok
```

### Structs and Stuff

Sometimes I want a construct that keeps related data about my cheese together. This is a struct.

My cheese struct will have a name, flavor profile, a list of items the cheese pairs well with, and a description of the cheese.

```elixir
defmodule CheeseStruct do
  @enforce_keys [:name]
  defstruct [:name, :flavor_profile, :pairs_well_with, :description]
end
```

```bash
{:module, CheeseStruct, <<70, 79, 82, 49, 0, 0, 15, ...>>, ...}
```

```elixir
defmodule CheeseAI do
  def describe(name) do
    schema = %{
      type: "object",
      properties: %{
        flavor_profile: %{type: "string"},
        pairs_well_with: %{type: "array", items: %{type: "string"}},
        description: %{type: "string"}
      },
      required: ["flavor_profile", "pairs_well_with", "description"],
      additionalProperties: false
    }

    response =
      Req.post!("https://api.openai.com/v1/responses",
        headers: [
          authorization: "Bearer #{System.fetch_env!("LB_OPEN_API_KEY")}"
        ],
        json: %{
          model: "gpt-4o-mini",
          input: "Describe #{name} cheese. Keep each field concise.",
          text: %{
            format: %{
              type: "json_schema",
              name: "cheese_details",
              strict: true,
              schema: schema
            }
          }
        }
      )

    %{status: 200, body: body} = response

    json_text =
      Enum.find_value(body["output"], fn
        %{"type" => "message", "content" => content} ->
          Enum.find_value(content, fn
            %{"type" => "output_text", "text" => text} -> text
            _ -> nil
          end)

        _ ->
          nil
      end)

    details = Jason.decode!(json_text)

    %CheeseStruct{
      name: name,
      flavor_profile: details["flavor_profile"],
      pairs_well_with: details["pairs_well_with"],
      description: details["description"]
    }
  end
end

# Start with one cheese so you can inspect the result:
CheeseAI.describe("brie")
```

```bash
%CheeseStruct{
  name: "brie",
  flavor_profile: "Mild, creamy, and slightly nutty with earthy undertones.",
  pairs_well_with: ["Baguette", "Crackers", "Fruits (like apples or pears)", "Nuts", "Honey",
   "Chardonnay", "Jam"],
  description: "Brie cheese is a soft French cheese known for its creamy interior and white, edible rind. It is made from cow's milk and has a smooth, buttery texture."
}
```

Now let's map over all our cheese and get their flavor profiles and pairings. This will take a few seconds because we are making a request to the OpenAI API for each cheese.

```elixir
cheesy_goodness = Enum.map(cheeses, &CheeseAI.describe/1)
```

```bash
[
  %CheeseStruct{
    name: "mozzerella",
    flavor_profile: "Mild, creamy, and slightly tangy with a fresh dairy flavor.",
    pairs_well_with: ["Tomatoes", "Basil", "Olive oil", "Balsamic vinegar", "Prosciutto", "Pizza",
     "Salads"],
    description: "Mozzarella is a soft, white cheese with a high moisture content, originally from Italy, made from buffalo or cow's milk."
  },
 # Abridged for brevity - they will all show up...
  %CheeseStruct{
    name: "brie",
    flavor_profile: "Rich, buttery, with earthy and nutty notes, and a slightly tangy finish.",
    pairs_well_with: ["Crackers", "Fresh fruits", "Nuts", "Honey", "Charcuterie", "Red wine"],
    description: "Brie is a soft cheese originating from France, characterized by its creamy interior and white, bloomy rind."
  }
]
```

Awesome! Now we have a catalog of cheeses with their flavor profiles and pairings.

Let's find out which of our cheeses pair well with crackers.

```elixir
Enum.filter(cheesy_goodness, fn cheese -> 
  Enum.any?(cheese.pairs_well_with, fn pairing ->  
    String.contains?(String.downcase(pairing), "crackers")
  end)
end)
```

```bash
[
  %CheeseStruct{
    name: "cheddar",
    flavor_profile: "Rich, nutty, and creamy, with a sharpness that increases with age.",
    pairs_well_with: ["Apples", "Crackers", "Red wine", "Pale ales", "Charcuterie"],
    description: "Cheddar cheese is a semi-hard cheese originating from England, known for its smooth texture and varying sharpness."
  },
  %CheeseStruct{
    name: "gouda",
    flavor_profile: "Sweet, nutty, and slightly caramel-like with a smooth finish.",
    pairs_well_with: ["Charcuterie", "Fruits", "Crackers", "Red wine", "Nuts"],
    description: "Gouda is a semi-hard cheese from the Netherlands, known for its rich, creamy texture and mild flavor."
  },
  %CheeseStruct{
    name: "brie",
    flavor_profile: "Rich, buttery, with earthy and nutty notes, and a slightly tangy finish.",
    pairs_well_with: ["Crackers", "Fresh fruits", "Nuts", "Honey", "Charcuterie", "Red wine"],
    description: "Brie is a soft cheese originating from France, characterized by its creamy interior and white, bloomy rind."
  }
]
```

Well that was great! But now, let's turn this into a reusable function to discover pairings.

We should also make sure that the function recieves a list of `CheeseStructs` because otherwise - who know what could happen! We could be left with poorly paired cheeses - or an exception we can't understand!!

```elixir
defmodule CheeseCatalog do
  def find_pairings(catalog, food_item) when is_list(catalog) and is_binary(food_item) do
    unless Enum.all?(catalog, &match?(%CheeseStruct{}, &1)) do
      raise ArgumentError, "catalog must be a list of CheeseStruct values"
    end
    search = String.downcase(food_item)
    Enum.filter(catalog, fn cheese ->
      Enum.any?(cheese.pairs_well_with, fn pairing -> 
        String.contains?(String.downcase(pairing), search)
      end)
    end)
  end
end

Enum.map(CheeseCatalog.find_pairings(cheesy_goodness, "red wine"), fn cheese -> cheese.name end)
```

```bash
["cheddar", "parmesan", "gouda", "brie"]
```

Let's add a test to the `CheeseCatalogTest` module to ensure that the `find_pairings` function works and throws understandable errors

```elixir
ExUnit.start(autorun: false)

defmodule CheeseCatalogTest do
  use ExUnit.Case, async: false

  test "finds a cheese by pairing, ignoring case" do
    catalog = [
      %CheeseStruct{name: "brie", pairs_well_with: ["Red Wine", "Apples"]},
      %CheeseStruct{name: "cheddar", pairs_well_with: ["Beer"]}
    ]

    assert [%CheeseStruct{name: "brie"}] =
             CheeseCatalog.find_pairings(catalog, "red wine")
  end

  test "rejects a list of strings" do
    assert_raise ArgumentError, fn ->
      CheeseCatalog.find_pairings(["brie", "cheddar"], "wine")
    end
  end
end

ExUnit.run()
```

<!-- livebook:{"offset":4873,"stamp":{"token":"XCP.FP7aKoSGZHGlEG3hE8hLJNgXYeuXNCatT6k-xuCS7zRmLGAehLOhAKc9QFJzrGKQcdwpe_gjBPOC1_hacgLhQHzJZFP9IP3ctfpYjaCP97AxjhKDAHIE","version":2}} -->

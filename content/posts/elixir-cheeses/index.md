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
series:
  - elixir-and-cheese
series_order: 1
code:
  maxShownLines: 999
draft: false
---

I've been playing around with Elixir, and I wanted an excuse to think out loud about data modeling in a language that treats structs and pattern matching as load-bearing walls, not decoration. Naturally, the excuse I landed on is cheese — a subject LLMs turn out to have shockingly strong opinions about. So: a cheese catalog, populated by AI, built entirely in Elixir. First, let's install `Req` so we can actually talk to the OpenAI API.

```elixir
Mix.install([
  {:req, "~> 0.7.4"}
])
```

## Playing Around With Cheese

I want a struct for my (deeply necessary) Hall of Cheeses. And since typing out flavor profiles and pairings by hand sounded like actual work, I'm outsourcing it — cheese, it turns out, is a topic LLMs have plenty to say about.

<!-- livebook:{"break_markdown":true} -->

Here's a short list to start with.

And, purely for the satisfaction of it, let's count them.

```elixir
cheeses = ["mozzerella", "cheddar", "parmesan", "gouda", "swiss", "brie"]
# How many cheeses do I have?
Enum.count(cheeses)
```

```bash
6
```

Just to get a feel for the pipe operator and functions in Elixir:

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

Sometimes you want one construct that holds related data together — in Elixir, that's a struct.

My cheese struct needs a name, a flavor profile, a list of pairings, and a description. If I had a cheese store, I could add things like price and inventory, but for now, let's keep it simple.

```elixir
defmodule CheeseStruct do
  @enforce_keys [:name]
  defstruct [:name, :flavor_profile, :pairs_well_with, :description]
end
```

```bash
{:module, CheeseStruct, <<70, 79, 82, 49, 0, 0, 15, ...>>, ...}
```

### Letting AI Fill In the Details

```elixir
defmodule CheeseAI do
  def describe(name) do
    # JSON schema the model must conform to - this is what makes the
    # response parseable instead of "here's a paragraph about brie"
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
          authorization: "Bearer #{System.fetch_env!("OPENAI_API_KEY")}"
        ],
        json: %{
          model: "gpt-4o-mini",
          input: "Describe #{name} cheese. Keep each field concise.",
          text: %{
            format: %{
              type: "json_schema",
              name: "cheese_details",
              strict: true,        # forces the model to match `schema` exactly
              schema: schema
            }
          }
        }
      )

    # Pattern match the response - if status isn't 200, this crashes loudly
    # instead of silently handing garbage to the code below.
    %{status: 200, body: body} = response

    # The Responses API nests the actual text a few levels deep inside
    # `output`, so dig through it to find the message content we care about.
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

    # `json_text` is a string containing JSON - decode it into a map.
    details = Jason.decode!(json_text)

    # Finally, build the struct so the rest of the code deals with
    # a %CheeseStruct{}, not a loose map of string keys.
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

### Building the Full Catalog

Now let's map over the whole list and get flavor profiles and pairings for each cheese. This takes a few seconds — one HTTP round-trip to OpenAI per cheese.

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

{{<admonition type="info" title="On Brie Inconsistencies" >}}
Note that the brie description is slightly different than the one we got when we asked for just brie. That's because the AI is generating a new response each time, and it doesn't have memory of previous responses.
{{</admonition>}}

And there it is — a full catalog of cheeses, each with an AI-generated flavor profile and a list of pairings.

Let's find out which of our cheeses actually pair well with crackers.

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

## From One-Off Filter to Reusable Function

That worked, but filtering by hand every time isn't exactly reusable. Let's turn it into a proper function.

We should also make sure the function actually receives a list of `CheeseStruct`s — otherwise, who knows what happens. Best case, nonsense pairings. Worst case, an exception no one can explain.

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

## Testing the Catalog

Let's add tests to `CheeseCatalogTest` to make sure `find_pairings` behaves — and fails loudly, not mysteriously, when it doesn't.

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

### Semantic Search and Future Features

Of course, this will only work on exact matches. If you want to find cheeses that pair with a "chardonet" or "wine" in general, or something "salty" you are going to need a more sophisticated search. You could use embeddings and vector search, or you could just ask the AI to do the work for you.

We will, G-d willing, address this in a future post. For now, we have a working cheese catalog, and a reusable function to find pairings. 

Bon appétit!

<!-- livebook:{"offset":4873,"stamp":{"token":"XCP.FP7aKoSGZHGlEG3hE8hLJNgXYeuXNCatT6k-xuCS7zRmLGAehLOhAKc9QFJzrGKQcdwpe_gjBPOC1_hacgLhQHzJZFP9IP3ctfpYjaCP97AxjhKDAHIE","version":2}} -->

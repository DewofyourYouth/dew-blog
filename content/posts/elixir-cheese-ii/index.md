---
title: "Pairing Elixir with Cheese, Part II: In Search of Something Salty"
slug: pairing-elixir-with-cheese-ii
date: 2026-09-25T09:00:00+03:00
categories:
  - Tech & Tools
tags:
  - elixir
  - livebook
  - ai
  - llm
  - openai
  - embeddings
  - semantic-search
  - cosine-similarity
  - structured-outputs
  - cheese
summary: "Embeddings taught my Elixir cheese catalog that cabernet means red wine, but a search for salty proved similarity isn't the same as a good pairing."
description: "An Elixir Livebook tutorial: semantic search over a cheese catalog with OpenAI embeddings and cosine similarity, and why an LLM recommender with JSON-schema output pairs better."
featuredImage: featured.jpg
featuredImageAlt: "A cheese board with brie, aged cheddar, and gouda beside red and white wine, next to a laptop showing Elixir IEx pairing queries and a similarity graph"
seo:
  images:
    - featured.jpg
series:
  - elixir-and-cheese
series_order: 2
code:
  maxShownLines: 999
draft: false
---

In [part one](/post/pairing-elixir-with-cheese/), I assembled a small Hall of Cheeses, persuaded an LLM to fill in the tasting notes, and wrote a function that finds cheeses whose pairing lists contain a given string. It works splendidly if I search for `red wine`. It is less helpful if I search for `cabernet`, which the catalog has never heard of.

I ended that post promising a more sophisticated search. Naturally, I tried embeddings. What follows is a record of me finding a perfectly reasonable answer to a question I hadn't quite meant to ask. When I say I want something that goes with `salty`, I mean I have something salty to eat and need a cheese to serve alongside it. This distinction will take me longer to notice than it should.

The cells below pick up where the [first notebook](/post/pairing-elixir-with-cheese/) left off. They assume `cheesy_goodness` is a list of `%CheeseStruct{}` values, Req is installed, and my API key is available as `OPENAI_API_KEY`.

## Teaching the Catalog to Search by Meaning

An embedding turns a piece of text into a list of numbers. Texts with related meanings tend to land near each other in that numerical space. We can embed each item in `pairs_well_with`, embed a search term, and rank the pairings by cosine similarity. For six cheeses, this is rather more machinery than the cheese board strictly requires. That is, of course, part of the appeal.

```elixir
defmodule CheeseSearch do
  # Turn the cheese catalog into searchable entries.
  # Each pairing gets its own entry and embedding.
  def build_index(catalog) do
    # Flatten the catalog: one entry per {cheese, pairing} combination,
    # so a cheese with five pairings becomes five searchable entries.
    entries =
      Enum.flat_map(catalog, fn %CheeseStruct{} = cheese ->
        Enum.map(cheese.pairs_well_with, fn pairing ->
          %{cheese: cheese, pairing: pairing}
        end)
      end)

    # Skip the API call entirely if there is nothing to embed.
    if entries == [] do
      []
    else
      # Send all pairing texts in one API request.
      vectors = embed(Enum.map(entries, & &1.pairing))

      # Attach each returned vector to its original pairing.
      Enum.zip(entries, vectors)
      |> Enum.map(fn {entry, vector} ->
        Map.put(entry, :vector, vector)
      end)
    end
  end

  # Return up to `limit` cheeses, ranked by similarity to the query.
  def search(index, query, limit \\ 3) do
    # The query must be embedded with the same model as the pairings.
    [query_vector] = embed([query])

    # Score every pairing in the index against the query.
    index
    |> Enum.map(fn entry ->
      %{
        cheese: entry.cheese,
        matching_pairing: entry.pairing,
        score: cosine_similarity(query_vector, entry.vector)
      }
    end)
    # Put the closest pairing first.
    |> Enum.sort_by(& &1.score, :desc)
    # A cheese may have several pairings. Keep only its best match.
    |> Enum.uniq_by(& &1.cheese.name)
    |> Enum.take(limit)
  end

  # Ask OpenAI to turn a batch of strings into numeric vectors.
  defp embed(texts) do
    response =
      Req.post!("https://api.openai.com/v1/embeddings",
        headers: [
          authorization: "Bearer #{System.fetch_env!("OPENAI_API_KEY")}"
        ],
        json: %{
          # A small, cheap embedding model is plenty for six cheeses.
          model: "text-embedding-3-small",
          # The API accepts a list, so one request can embed many strings.
          input: texts,
          encoding_format: "float"
        }
      )

    case response do
      %{status: 200, body: %{"data" => data}} ->
        # Use the API's index field to restore input order before
        # matching vectors with their original pairing texts.
        data
        |> Enum.sort_by(& &1["index"])
        |> Enum.map(& &1["embedding"])

      %{status: status, body: body} ->
        raise "Embedding request failed (#{status}): #{inspect(body)}"
    end
  end

  # Measure how close two vectors point in embedding space.
  # A higher score means the texts are more similar to the model.
  defp cosine_similarity(a, b) do
    # Cosine similarity = dot(a, b) / (|a| * |b|).
    # First, multiply matching components and add them up.
    dot =
      Enum.zip(a, b)
      |> Enum.reduce(0.0, fn {x, y}, sum -> sum + x * y end)

    # Then take each vector's length (its Euclidean norm).
    length_a = :math.sqrt(Enum.reduce(a, 0.0, fn x, sum -> sum + x * x end))
    length_b = :math.sqrt(Enum.reduce(b, 0.0, fn x, sum -> sum + x * x end))

    # Dividing by the lengths leaves only the angle between the vectors.
    dot / (length_a * length_b)
  end
end
```

There are two API steps here. `build_index/1` embeds all the pairing strings in one batch; `search/3` embeds the new query. The arithmetic after that happens in Elixir. I keep the index in its own Livebook cell so I can try another query without regenerating every cheese vector.

```elixir
# Do this once for the current catalog.
cheese_index = CheeseSearch.build_index(cheesy_goodness)
```

```result
[
  %{
    cheese: %CheeseStruct{
      name: "mozzerella",
      flavor_profile: "Mild, creamy, and slightly tangy with a stretchy texture.",
      pairs_well_with: ["Tomatoes", "Basil", "Olive oil", "Balsamic vinegar", "Prosciutto"],
      description: "Mozzarella is a soft, white cheese originating from Italy, traditionally made from water buffalo milk."
    },
    pairing: "Tomatoes",
    vector: [0.01557159423828125, -0.0254974365234375, -0.0297088623046875, 0.0272979736328125,
     0.0115814208984375, -0.04791259765625, 0.01983642578125, -0.00588226318359375,
     -0.00750732421875, -0.028167724609375, 0.043487548828125, 0.0179595947265625, 0.019775390625,
     0.0157928466796875, -0.002368927001953125, 0.00505828857421875, 0.00272369384765625,
     0.0193328857421875, 0.00982666015625, 0.03350830078125, 0.0555419921875, 0.007190704345703125,
     0.005767822265625, -0.031890869140625, 0.01090240478515625, 0.02801513671875,
     -0.01392364501953125, 0.046356201171875, -6.814002990722656e-4, -0.045166015625,
     0.038970947265625, -0.047088623046875, -0.0086517333984375, -0.01078033447265625,
     -0.01100921630859375, -0.02557373046875, 0.016448974609375, 0.06158447265625,
     0.0157318115234375, 0.0212249755859375, -0.0081939697265625, 0.0361328125,
     -0.01136016845703125, 0.0078582763671875, 0.0159454345703125, -0.023345947265625,
     -0.05902099609375, 0.015899658203125, 0.00572967529296875, 0.026824951171875,
     -1.850128173828125e-4, -0.0753173828125, -0.024017333984375, 0.034332275390625, -0.0322265625,
     -0.01557159423828125, -0.005859375, 0.053375244140625, 0.0156402587890625, 0.024627685546875,
     -0.040771484375, -0.0035686492919921875, 0.03350830078125, -0.03045654296875,
     0.01352691650390625, -0.04150390625, 0.00939178466796875, 0.007022857666015625,
     -0.007843017578125, 0.0214691162109375, -0.0095062255859375, 0.048583984375, -0.04583740234375,
     0.0165863037109375, 0.039306640625, 0.00931549072265625, -0.015228271484375,
     0.00106048583984375, 0.033935546875, 0.031768798828125, -0.0066070556640625,
     0.0294647216796875, -0.007965087890625, -0.009765625, -0.024688720703125,
     -0.001216888427734375, -0.0257110595703125, ...]
  },
  ...
]
```

Now, what happens if I ask for a cabernet?

```elixir
# Try different queries without rebuilding the index.
CheeseSearch.search(cheese_index, "cabernet")
```

```result
[
  %{
    cheese: %CheeseStruct{
      name: "brie",
      flavor_profile: "Mild, buttery, and earthy with a slight nuttiness.",
      pairs_well_with: ["crackers", "fruit", "nuts", "honey", "red wine"],
      description: "A soft, creamy cheese from France with a white, bloomy rind."
    },
    matching_pairing: "red wine",
    score: 0.5815349151581114
  },
  %{
    cheese: %CheeseStruct{
      name: "cheddar",
      flavor_profile: "Rich, nutty, and sharp, Cheddar develops a stronger flavor with aging, becoming crumbly and tangy.",
      pairs_well_with: ["Apples", "Crackers", "Red wine", "Beer", "Nuts"],
      description: "Cheddar cheese is a hard, natural cheese made from cow's milk that originated in England. It varies in color from white to deep orange, often enhanced with annatto."
    },
    matching_pairing: "Red wine",
    score: 0.5215413024063058
  },
  %{
    cheese: %CheeseStruct{
      name: "parmesan",
      flavor_profile: "Nutty, savory, and slightly fruity with a strong umami presence.",
      pairs_well_with: ["Pasta", "Red wine", "Olive oil", "Fruits", "Nuts", "Soup"],
      description: "Parmesan cheese is a hard, aged cheese originating from Italy, known for its granular texture."
    },
    matching_pairing: "Red wine",
    score: 0.5215413024063058
  }
]
```

This is the trick I wanted: a query can retrieve a related phrase even when the exact word doesn't occur in the list. It is a **ranking**, though, not a ruling from an accredited cheese authority. The function always returns up to three cheeses, even if the third result is a rather heroic stretch.

## A Salty Problem

Let’s search for `salty`. I am imagining a salty snack in need of a cheese.

```elixir
CheeseSearch.search(cheese_index, "salty")
```

```result
[
  %{
    cheese: %CheeseStruct{
      name: "parmesan",
      flavor_profile: "Nutty, savory, and slightly fruity with a strong umami presence.",
      pairs_well_with: ["Pasta", "Red wine", "Olive oil", "Fruits", "Nuts", "Soup"],
      description: "Parmesan cheese is a hard, aged cheese originating from Italy, known for its granular texture."
    },
    matching_pairing: "Soup",
    score: 0.3568933978791376
  },
  %{
    cheese: %CheeseStruct{
      name: "brie",
      flavor_profile: "Mild, buttery, and earthy with a slight nuttiness.",
      pairs_well_with: ["crackers", "fruit", "nuts", "honey", "red wine"],
      description: "A soft, creamy cheese from France with a white, bloomy rind."
    },
    matching_pairing: "honey",
    score: 0.34962333190240713
  },
  %{
    cheese: %CheeseStruct{
      name: "swiss",
      flavor_profile: "Mild, nutty, and slightly sweet with a creamy texture.",
      pairs_well_with: ["Charcuterie meats", "Fruits (like apples and pears)", "Mustards",
       "Breads and crackers", "White wine (like Riesling)", "Pickles"],
      description: "Swiss cheese is a semi-hard cheese known for its characteristic holes and pale yellow color, originating from Switzerland."
    },
    matching_pairing: "Pickles",
    score: 0.3304594019097383
  }
]
```

My run put Parmesan first because `"Soup"` was its nearest pairing; Brie came up through `"honey"`, and Swiss through `"Pickles"`. But I wasn't asking for a food whose name is semantically near *salty*. I had a salty food in mind and wanted to know which cheese would go well **with it**. Even if pickles happen to be salty, a similarity score between `"salty"` and `"Pickles"` doesn't tell me why Swiss would be the right cheese for my snack. Nor does `"honey"` tell me that Brie would be wrong: sweetness might be exactly the contrast I want.

The search was working exactly as designed. It just wasn't designed to answer the question I was actually asking.

## Similar Is Not the Same as Good Together

Suppose I have salty pretzels and want to know which cheese to serve with them. A search for *similar* flavors might favor a salty cheese. But a good pairing could instead use creaminess to soften the salt, acidity to cut the richness, or a sharper flavor that stands up to the pretzel. Likewise, honey may work with a salty cheese because the flavors contrast. `"Pretzels"` appearing in a pairing list would be useful evidence, but its absence tells me very little. Those lists were improvised by an LLM in the first place.

That is a different job. Instead of retrieving text near `"salty"` in embedding space, I can give the model the whole six-cheese catalog and ask it to recommend a cheese for my snack, with reasons. At this size I do not need a vector database, or even an index. I need to ask a better question.

```elixir
defmodule CheeseRecommender do
  # Ask the model to choose cheeses from the catalog for a given food,
  # then map its answers back onto real %CheeseStruct{} values.
  def recommend(catalog, food) when is_list(catalog) and is_binary(food) do
    # Send only the fields needed to make a pairing recommendation.
    cheese_data =
      Enum.map(catalog, fn %CheeseStruct{} = cheese ->
        %{
          name: cheese.name,
          flavor_profile: cheese.flavor_profile,
          pairs_well_with: cheese.pairs_well_with
        }
      end)

    # A JSON Schema describing the only shape of answer we'll accept:
    # %{"recommendations" => [%{"name" => ..., "reason" => ...}, ...]}
    schema = %{
      type: "object",
      properties: %{
        recommendations: %{
          type: "array",
          items: %{
            type: "object",
            properties: %{
              name: %{type: "string"},
              reason: %{type: "string"}
            },
            # Strict mode requires every property to be listed here
            # and forbids any extra keys.
            required: ["name", "reason"],
            additionalProperties: false
          }
        }
      },
      required: ["recommendations"],
      additionalProperties: false
    }

    # Call the Responses API with the prompt and the schema.
    response =
      Req.post!("https://api.openai.com/v1/responses",
        headers: [
          authorization: "Bearer #{System.fetch_env!("OPENAI_API_KEY")}"
        ],
        json: %{
          model: "gpt-4o-mini",
          # The prompt explicitly allows contrast, not just similarity,
          # and embeds the catalog as JSON so the model can only pick from it.
          input: """
          Recommend up to three cheeses from the catalog to serve with #{food}.

          Consider how flavors and textures complement or contrast with the food.
          A good pairing does not need to have similar flavors. Treat the existing
          pairs_well_with lists as suggestions, not exhaustive rules.

          Use only cheese names from this catalog. Rank your choices best first.
          Give a brief, specific reason for each choice.

          Catalog:
          #{Jason.encode!(cheese_data)}
          """,
          # Constrain the output to match our schema exactly.
          text: %{
            format: %{
              type: "json_schema",
              name: "cheese_recommendations",
              strict: true,
              schema: schema
            }
          }
        }
      )

    # Crash loudly on anything but a successful response.
    %{status: 200, body: body} = response

    # The response's "output" is a list of items. Find the first message,
    # then the first output_text inside it; that text is our JSON string.
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

    # Thanks to the schema, this pattern match should always succeed.
    %{"recommendations" => recommendations} = Jason.decode!(json_text)

    # Convert the model's cheese names back into your actual structs.
    cheeses_by_name =
      Map.new(catalog, fn cheese ->
        {String.downcase(cheese.name), cheese}
      end)

    # Keep at most three, look each one up, and drop any duplicates.
    recommendations
    |> Enum.take(3)
    |> Enum.map(fn %{"name" => name, "reason" => reason} ->
      cheese =
        Map.fetch!(
          cheeses_by_name,
          String.downcase(name)
        )

      %{cheese: cheese, reason: reason}
    end)
    |> Enum.uniq_by(& &1.cheese.name)
  end
end
```

The model returns names and reasons in JSON. I look those names up in my actual catalog and return the corresponding structs, so the rest of the notebook doesn't have to trust arbitrary cheese-shaped text. `Map.fetch!/2` also fails loudly if the model invents a cheese that isn't in the catalog. Given my earlier concern about poorly paired cheeses and mysterious exceptions, I rather like that.

```elixir
CheeseRecommender.recommend(cheesy_goodness, "salty pretzels")
```

```result
[
  %{
    reason: "The sharp, rich flavor of cheddar contrasts beautifully with the saltiness of pretzels, enhancing their taste while providing a satisfying crumbly texture.",
    cheese: %CheeseStruct{
      name: "cheddar",
      flavor_profile: "Rich, nutty, and sharp, Cheddar develops a stronger flavor with aging, becoming crumbly and tangy.",
      pairs_well_with: ["Apples", "Crackers", "Red wine", "Beer", "Nuts"],
      description: "Cheddar cheese is a hard, natural cheese made from cow's milk that originated in England. It varies in color from white to deep orange, often enhanced with annatto."
    }
  },
  %{
    reason: "Gouda's mild nuttiness and slight sweetness harmonizes well with the salt, creating a delightful balance that enhances each bite.",
    cheese: %CheeseStruct{
      name: "gouda",
      flavor_profile: "Mild and nutty when young; caramel and complex when aged, with a slight sweetness.",
      pairs_well_with: ["Crackers", "Nuts", "Fruits", "Red wine", "Beer"],
      description: "Gouda is a semi-hard cheese from the Netherlands, known for its smooth texture and rich flavor. It can be young or aged, with varying characteristics."
    }
  },
  %{
    reason: "Parmesan's strong umami flavor adds depth to the saltiness of the pretzels, while its crumbly texture offers an interesting contrast.",
    cheese: %CheeseStruct{
      name: "parmesan",
      flavor_profile: "Nutty, savory, and slightly fruity with a strong umami presence.",
      pairs_well_with: ["Pasta", "Red wine", "Olive oil", "Fruits", "Nuts", "Soup"],
      description: "Parmesan cheese is a hard, aged cheese originating from Italy, known for its granular texture."
    }
  }
]
```

This is closer to what I wanted from a pairing recommender. It can explain why a particular cheese would balance a salty pretzel, rather than merely announcing which pairing string happens to sit nearest the word `salty`. Whether I agree with its taste is another matter. That sounds like an excellent excuse to buy some cheese.

The three approaches now have different jobs: the original filter finds literal text, embeddings retrieve related text, and the recommender reasons across the small catalog. I started out expecting one of them to replace the others. It turns out the more useful result was figuring out what question each one answers.

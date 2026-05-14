from PIL import Image

FURNITURE_TYPES = ['диван','кресло','стол','стул','шкаф','кровать','комод','тумба']
FURNITURE_PROMPTS = ['a sofa or couch','an armchair','a table or desk','a chair',
                     'a wardrobe or closet','a bed','a chest of drawers','a nightstand']

COLORS = ['белый','чёрный','серый','коричневый','бежевый','синий','зелёный',
          'красный','жёлтый','розовый','оранжевый','фиолетовый']
COLOR_PROMPTS = [f'{c} colored furniture' for c in
                 ['white','black','gray','brown','beige','blue','green',
                  'red','yellow','pink','orange','purple']]
ROOM_COLOR_PROMPTS = [p.replace('furniture', 'furniture or decor object in the room')
                      for p in COLOR_PROMPTS]

MATERIALS = ['дерево','ткань','металл','стекло','кожа','пластик']
MATERIAL_PROMPTS = ['wooden furniture','fabric upholstered furniture','metal furniture',
                    'glass furniture','leather furniture','plastic furniture']

STYLES = ['лофт','минимализм','классика','модерн','скандинавский']
STYLE_PROMPTS = ['loft industrial style','minimalist style','classic traditional style',
                 'modern contemporary style','scandinavian nordic style']

ROOM_STYLES = ['лофт','минимализм','классика','модерн','скандинавский','прованс','хай-тек']
ROOM_STYLE_PROMPTS = ['loft industrial interior','minimalist interior','classic interior',
                      'modern interior','scandinavian interior','provencal interior','high-tech interior']


class FurnitureAnalyzer:
    def __init__(self):
        self.model = self.processor = None
        self.model_loaded = False

    def _load_model(self):
        if self.model_loaded: return True
        try:
            import torch
            from transformers import CLIPProcessor, CLIPModel
            self.model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
            self.processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
            self.model_loaded = True
            print("✓ CLIP загружен")
            return True
        except Exception as e:
            print(f"✗ Ошибка загрузки CLIP: {e}"); return False

    def _run(self, image, prompts):
        import torch
        inputs = self.processor(text=prompts, images=image, return_tensors="pt", padding=True)
        with torch.no_grad():
            return self.model(**inputs).logits_per_image.softmax(dim=1)[0]

    def _classify(self, image, prompts, labels, threshold=0.12):
        try:
            probs = self._run(image, prompts)
            idx = probs.argmax().item()
            return labels[idx] if probs[idx].item() > threshold else None
        except Exception: return None

    def _classify_multi(self, image, prompts, labels, top_k=2, threshold=0.08):
        try:
            probs = self._run(image, prompts)
            top_p, top_i = probs.topk(min(top_k * 2, len(labels)))
            result = [labels[i.item()] for p, i in zip(top_p, top_i) if p.item() > threshold][:top_k]
            return result or [labels[0]]
        except Exception: return labels[:top_k]

    def analyze_image(self, image_file):
        if not self._load_model():
            return {'type': None, 'colors': ['серый','коричневый','бежевый'], 'materials': ['дерево','ткань'], 'style': None}
        try:
            img = Image.open(image_file.stream).convert('RGB')
            return {
                'type':      self._classify(img, FURNITURE_PROMPTS, FURNITURE_TYPES, 0.10),
                'colors':    self._classify_multi(img, COLOR_PROMPTS, COLORS, 2, 0.08),
                'materials': self._classify_multi(img, MATERIAL_PROMPTS, MATERIALS, 2, 0.10),
                'style':     self._classify(img, STYLE_PROMPTS, STYLES, 0.15),
            }
        except Exception: return None

    def analyze_room(self, image_file):
        if not self._load_model():
            return {'style': None, 'colors': ['белый','серый','бежевый']}
        try:
            img = Image.open(image_file).convert('RGB')
            return {
                'style':  self._classify(img, ROOM_STYLE_PROMPTS, ROOM_STYLES, 0.10),
                'colors': self._classify_multi(img, ROOM_COLOR_PROMPTS, COLORS, 4, 0.05),
            }
        except Exception: return {'style': None, 'colors': ['белый','серый','бежевый']}

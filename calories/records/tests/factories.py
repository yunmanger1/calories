import factory
from django.utils import timezone


class RecordFactory(factory.django.DjangoModelFactory):

    title = factory.Sequence(lambda n: 'title %d' % n)
    calories = 100
    time = factory.LazyAttribute(lambda x: timezone.now())

    class Meta:
        model = 'records.Record'
